import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/format";
import { getCurrentMember } from "@/lib/session";

interface DecisionPageProps {
  params: { id: string };
}

export default async function PostMortemPage({ params }: DecisionPageProps) {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/login");
  }

  const decision = await prisma.decision.findFirst({
    where: {
      id: params.id,
      teamId: member.teamId
    },
    select: {
      id: true,
      title: true,
      outcome: true,
      observedUplift: true,
      resolvedAt: true,
      postMortem: true
    }
  });

  if (!decision) {
    return (
      <div className="rf-card text-sm text-slate-600">Decision not found.</div>
    );
  }

  const postMortem = decision.postMortem;

  return (
    <div className="space-y-6">
      <section className="rf-card space-y-2">
        <p className="rf-pill">Post-Mortem</p>
        <h1 className="text-2xl font-semibold text-slate-900">{decision.title}</h1>
        <p className="text-sm text-slate-600">
          Reflect on the forecast and capture learnings for the next cycle.
        </p>
      </section>

      <section className="rf-card space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Business error
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {formatNumber(postMortem?.businessErrorPp, " pp")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Expectation error
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {formatNumber(postMortem?.expectationErrorPp, " pp")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatDate(postMortem?.createdAt ?? null)}
            </p>
          </div>
        </div>
        {decision.outcome ? (
          <p className="text-xs text-slate-500">
            Outcome: {decision.outcome} · Observed uplift{" "}
            {formatNumber(decision.observedUplift, "%")} · Resolved{" "}
            {formatDate(decision.resolvedAt ?? null)}
          </p>
        ) : null}

        <div className="grid gap-3 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              What we misjudged
            </p>
            <p>{postMortem?.whatWeMisjudged ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Decision taken
            </p>
            <p>{postMortem?.decisionTaken ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Learning captured
            </p>
            <p>{postMortem?.learningCaptured ?? "—"}</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Link href={`/decisions/${decision.id}/resolution`} className="rf-button-secondary">
          Back to Resolution
        </Link>
        <Link href="/dashboard" className="rf-button">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
