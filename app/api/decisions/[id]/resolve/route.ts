import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/session";

function parseCsv(text: string) {
  const rawLines = text.split(/\r?\n/).map((line) => line.trim());
  const lines = rawLines.filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("CSV file is empty.");
  }

  if (lines.length === 1) {
    throw new Error("CSV has no data rows.");
  }

  const headerColumns = lines[0].split(",").map((value) => value.trim().toLowerCase());
  let convertedIndex = headerColumns.indexOf("converted");
  if (convertedIndex === -1) {
    convertedIndex = 0;
  }

  let convertedCount = 0;
  let sampleSize = 0;

  for (let i = 1; i < lines.length; i += 1) {
    const columns = lines[i].split(",").map((value) => value.trim());
    if (columns.length <= convertedIndex) {
      throw new Error("CSV format is invalid.");
    }

    const value = columns[convertedIndex];
    if (value !== "0" && value !== "1") {
      throw new Error("CSV format is invalid.");
    }

    sampleSize += 1;
    if (value === "1") {
      convertedCount += 1;
    }
  }

  if (sampleSize === 0) {
    throw new Error("CSV has zero data rows.");
  }

  const conversionRate = convertedCount / sampleSize;
  const uplift = Number((conversionRate * 100).toFixed(2));

  return { sampleSize, uplift };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const member = await getCurrentMember();

    if (!member) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "CSV file is required." },
        { status: 400 }
      );
    }

    const decision = await prisma.decision.findFirst({
      where: {
        id: params.id,
        teamId: member.teamId
      },
      select: {
        id: true,
        thresholdPercent: true,
        outcome: true,
        resolvedAt: true
      }
    });

    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found." },
        { status: 400 }
      );
    }

    if (decision.outcome !== null || decision.resolvedAt !== null) {
      return NextResponse.json(
        { error: "Decision already resolved. Re-resolution is not allowed." },
        { status: 400 }
      );
    }

    const text = await file.text();
    const { sampleSize, uplift } = parseCsv(text);

    const outcome = uplift >= decision.thresholdPercent ? "YES" : "NO";
    const resolvedAt = new Date();

    const expectations = await prisma.expectation.findMany({
      where: { decisionId: decision.id },
      select: { choice: true }
    });

    const totalExpectations = expectations.length;
    const yesCount = expectations.filter(
      (expectation) => expectation.choice === "YES"
    ).length;
    const unresolvedCount = expectations.filter(
      (expectation) => expectation.choice === "UNRESOLVED"
    ).length;
    const yesShare = totalExpectations > 0 ? yesCount / totalExpectations : 0;

    const businessErrorPp = Number(
      Math.abs(decision.thresholdPercent - uplift).toFixed(1)
    );

    const expectationErrorPp = Number(
      (
        outcome === "YES"
          ? (1 - yesShare) * 100
          : outcome === "NO"
            ? yesShare * 100
            : 0
      ).toFixed(1)
    );

    const avgExpectation =
      totalExpectations > 0
        ? expectations.reduce((sum, expectation) => {
            if (expectation.choice === "YES") return sum + 1;
            if (expectation.choice === "NO") return sum + 0;
            return sum + 0.5;
          }, 0) / totalExpectations
        : 0.5;
    const unresolvedRatio =
      totalExpectations > 0 ? unresolvedCount / totalExpectations : 0;

    let whatWeMisjudged = "Expectation alignment was relatively accurate.";
    if (avgExpectation > 0.6 && outcome === "NO") {
      whatWeMisjudged = "The team overestimated the expected positive impact.";
    } else if (avgExpectation < 0.4 && outcome === "YES") {
      whatWeMisjudged = "The team underestimated the potential upside.";
    } else if (unresolvedRatio > 0.3) {
      whatWeMisjudged = "High uncertainty across roles reduced prediction accuracy.";
    }

    const decisionTaken =
      outcome === "YES"
        ? "Proceed with rollout based on observed uplift."
        : "Do not roll out based on observed results.";

    const learningCaptured = `Threshold was ${decision.thresholdPercent}%. Observed uplift was ${uplift}%. Business error was ${businessErrorPp} pp. Expectation error was ${expectationErrorPp} pp. Improve signal clarity before the next decision.`;

    await prisma.$transaction([
      prisma.decision.update({
        where: { id: decision.id },
        data: {
          observedUplift: uplift,
          sampleSize,
          outcome,
          resolvedAt,
          status: "RESOLVED"
        }
      }),
      prisma.postMortem.upsert({
        where: { decisionId: decision.id },
        update: {
          businessErrorPp,
          expectationErrorPp,
          whatWeMisjudged,
          decisionTaken,
          learningCaptured
        },
        create: {
          decisionId: decision.id,
          businessErrorPp,
          expectationErrorPp,
          whatWeMisjudged,
          decisionTaken,
          learningCaptured
        }
      })
    ]);

    return NextResponse.json({ sampleSize, uplift, outcome }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid CSV file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
