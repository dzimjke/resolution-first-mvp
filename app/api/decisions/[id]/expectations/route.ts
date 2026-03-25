import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/session";

const ROLE_VALUES = ["PRODUCT", "ANALYTICS", "ENGINEERING", "GROWTH", "OTHER"] as const;
const CHOICE_VALUES = ["YES", "NO", "UNRESOLVED"] as const;

type RoleValue = (typeof ROLE_VALUES)[number];
type ChoiceValue = (typeof CHOICE_VALUES)[number];

function isRole(value: unknown): value is RoleValue {
  return typeof value === "string" && ROLE_VALUES.includes(value as RoleValue);
}

function isChoice(value: unknown): value is ChoiceValue {
  return typeof value === "string" && CHOICE_VALUES.includes(value as ChoiceValue);
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

    const body = await request.json();
    const { role, choice, comment } = body ?? {};

    if (!isRole(role)) {
      return NextResponse.json(
        { error: "Role is required and must be a valid value." },
        { status: 400 }
      );
    }

    if (!isChoice(choice)) {
      return NextResponse.json(
        { error: "Choice is required and must be a valid value." },
        { status: 400 }
      );
    }

    let normalizedComment: string | null = null;
    if (typeof comment === "string") {
      const trimmed = comment.trim();
      if (trimmed.length > 280) {
        return NextResponse.json(
          { error: "Comment must be 280 characters or fewer." },
          { status: 400 }
        );
      }
      normalizedComment = trimmed.length > 0 ? trimmed : null;
    } else if (comment !== null && comment !== undefined) {
      return NextResponse.json(
        { error: "Comment must be a string or null." },
        { status: 400 }
      );
    }

    const decision = await prisma.decision.findFirst({
      where: {
        id: params.id,
        teamId: member.teamId
      },
      select: { id: true }
    });

    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found." },
        { status: 400 }
      );
    }

    const expectation = await prisma.expectation.create({
      data: {
        decisionId: decision.id,
        role,
        choice,
        comment: normalizedComment
      }
    });

    return NextResponse.json(expectation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
