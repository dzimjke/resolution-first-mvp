import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/format";
import { getCurrentMember } from "@/lib/session";

export default async function DashboardPage() {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/login");
  }

  const decisions = await prisma.decision.findMany({
    where: { teamId: member.teamId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { expectations: true } }
    }
  });

  return (
    <div className="space-y-8">
      <section className="rf-card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="rf-pill">Decision Flow</p>
          <h1 className="text-2xl font-semibold text-slate-900">Resolution-first dashboard</h1>
          <p className="text-sm text-slate-600">
            Track active decisions, align expectations, and resolve outcomes with
            clarity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/wizard" className="rf-button">
            Open Decision Gate
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Decisions</h2>
          <span className="text-sm text-slate-500">{decisions.length} total</span>
        </div>

        {decisions.length === 0 ? (
          <div className="rf-card text-sm text-slate-600">
            No decisions yet. Use the Decision Gate to draft a new one.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {decisions.map((decision) => {
              const displayStatus = decision.outcome ? "RESOLVED" : decision.status;
              return (
                <div key={decision.id} className="rf-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rf-pill">{displayStatus}</span>
                    <span className="text-xs text-slate-500">
                      Created {formatDate(decision.createdAt)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {decision.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      First action: {decision.firstAction}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600">
                    <div>
                      Time window: {formatNumber(decision.timeWindowMinutes, " min")}
                    </div>
                    <div>
                      Threshold: {formatNumber(decision.thresholdPercent, "%")} uplift
                    </div>
                    <div>
                      Expectations captured: {decision._count.expectations}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Resolution: {decision.outcome ?? "Pending"}
                    </span>
                    <Link
                      href={`/decisions/${decision.id}/details`}
                      className="rf-button-secondary"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
