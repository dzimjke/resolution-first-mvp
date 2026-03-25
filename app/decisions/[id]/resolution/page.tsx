import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/format";
import ResolutionUploadForm from "./ResolutionUploadForm";
import { getCurrentMember } from "@/lib/session";

interface DecisionPageProps {
  params: { id: string };
}

export default async function ResolutionPage({ params }: DecisionPageProps) {
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
      sampleSize: true,
      resolvedAt: true
    }
  });

  if (!decision) {
    return (
      <div className="rf-card text-sm text-slate-600">Decision not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rf-card space-y-2">
        <p className="rf-pill">Resolution</p>
        <h1 className="text-2xl font-semibold text-slate-900">{decision.title}</h1>
        <p className="text-sm text-slate-600">
          Capture the outcome once the observation window closes.
        </p>
      </section>

      <section className="rf-card space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Outcome</p>
            <p className="text-lg font-semibold text-slate-900">
              {decision.outcome ?? "UNRESOLVED"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Observed uplift
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {formatNumber(decision.observedUplift, "%")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sample size</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatNumber(decision.sampleSize)}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Resolved at {formatDate(decision.resolvedAt ?? null)}
        </p>
        {decision.outcome ? (
          <p className="text-sm text-slate-600">
            This decision has already been resolved on{" "}
            {formatDate(decision.resolvedAt ?? null)}. Further uploads are
            disabled.
          </p>
        ) : (
          <ResolutionUploadForm decisionId={decision.id} />
        )}
      </section>

      <div className="flex items-center justify-between">
        <Link href={`/decisions/${decision.id}/market`} className="rf-button-secondary">
          Back to Market
        </Link>
        <Link href={`/decisions/${decision.id}/post-mortem`} className="rf-button">
          Next: Post-Mortem
        </Link>
      </div>
    </div>
  );
}
