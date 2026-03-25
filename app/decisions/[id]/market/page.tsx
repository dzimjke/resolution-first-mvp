import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/format";
import { getCurrentMember } from "@/lib/session";

interface DecisionPageProps {
  params: { id: string };
}

export default async function MarketPage({ params }: DecisionPageProps) {
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
      firstAction: true,
      timeWindowMinutes: true,
      thresholdPercent: true,
      updatedAt: true
    }
  });

  if (!decision) {
    return (
      <div className="rf-card text-sm text-slate-600">Decision not found.</div>
    );
  }

  const [totalExpectations, yesCount, noCount, unresolvedCount] =
    await Promise.all([
      prisma.expectation.count({ where: { decisionId: decision.id } }),
      prisma.expectation.count({
        where: { decisionId: decision.id, choice: "YES" }
      }),
      prisma.expectation.count({
        where: { decisionId: decision.id, choice: "NO" }
      }),
      prisma.expectation.count({
        where: { decisionId: decision.id, choice: "UNRESOLVED" }
      })
    ]);

  return (
    <div className="space-y-6">
      <section className="rf-card space-y-2">
        <p className="rf-pill">Market Evidence</p>
        <h1 className="text-2xl font-semibold text-slate-900">{decision.title}</h1>
        <p className="text-sm text-slate-600">
          Track early signals for the first action: {decision.firstAction}.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rf-card space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Time Window</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatNumber(decision.timeWindowMinutes, " min")}
          </p>
          <p className="text-sm text-slate-600">
            Observed over the first cohort window.
          </p>
        </div>
        <div className="rf-card space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Threshold</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatNumber(decision.thresholdPercent, "%")}
          </p>
          <p className="text-sm text-slate-600">Expected uplift for activation.</p>
        </div>
        <div className="rf-card space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Expectations</p>
          <p className="text-2xl font-semibold text-slate-900">
            {totalExpectations}
          </p>
          <p className="text-sm text-slate-600">Captured across roles.</p>
        </div>
      </section>

      <section className="rf-card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Expectation pulse</h2>
        <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            YES signals: {yesCount}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            NO signals: {noCount}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            Unresolved: {unresolvedCount}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Last updated {formatDate(decision.updatedAt)}
        </p>
      </section>

      <div className="flex items-center justify-between">
        <Link href={`/decisions/${decision.id}/details`} className="rf-button-secondary">
          Back to Details
        </Link>
        <Link href={`/decisions/${decision.id}/resolution`} className="rf-button">
          Next: Resolution
        </Link>
      </div>
    </div>
  );
}
