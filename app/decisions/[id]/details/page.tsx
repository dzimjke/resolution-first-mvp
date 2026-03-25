import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/format";
import AddExpectationForm from "./AddExpectationForm";
import { getCurrentMember } from "@/lib/session";

interface DecisionPageProps {
  params: { id: string };
}

export default async function DecisionDetailsPage({ params }: DecisionPageProps) {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/login");
  }

  const decision = await prisma.decision.findFirst({
    where: {
      id: params.id,
      teamId: member.teamId
    },
    include: { expectations: { orderBy: { createdAt: "desc" } } }
  });

  if (!decision) {
    return (
      <div className="rf-card text-sm text-slate-600">Decision not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rf-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="rf-pill">{decision.status}</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              {decision.title}
            </h1>
          </div>
          <span className="text-sm text-slate-500">
            Created {formatDate(decision.createdAt)}
          </span>
        </div>
        <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            First action: {decision.firstAction}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            Time window: {formatNumber(decision.timeWindowMinutes, " min")}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            Threshold: {formatNumber(decision.thresholdPercent, "%")} uplift
          </div>
        </div>
      </section>

      <section className="rf-card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Expectations</h2>
        <AddExpectationForm decisionId={decision.id} />
        {decision.expectations.length === 0 ? (
          <p className="text-sm text-slate-600">No expectations logged yet.</p>
        ) : (
          <div className="grid gap-3">
            {decision.expectations.map((expectation) => (
              <div
                key={expectation.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800">
                    {expectation.role}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(expectation.createdAt)}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {expectation.choice}
                </div>
                <div className="max-w-md text-xs text-slate-500">
                  {expectation.comment ?? "No comment"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rf-button-secondary">
          Back to Dashboard
        </Link>
        <Link href={`/decisions/${decision.id}/market`} className="rf-button">
          Next: Market Evidence
        </Link>
      </div>
    </div>
  );
}
