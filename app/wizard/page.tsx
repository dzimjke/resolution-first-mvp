import Link from "next/link";

export default function WizardPage() {
  return (
    <div className="space-y-6">
      <div className="rf-card space-y-2">
        <p className="rf-pill">Decision Gate</p>
        <h1 className="text-2xl font-semibold text-slate-900">Draft a new decision</h1>
        <p className="text-sm text-slate-600">
          This lightweight wizard captures the essentials before a decision enters
          the main flow.
        </p>
      </div>

      <div className="rf-card space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            Decision title
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              placeholder="Should we roll out onboarding v2?"
              disabled
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            First measurable action
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              placeholder="Create first project within 30 minutes"
              disabled
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Time window (minutes)
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              placeholder="30"
              disabled
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Threshold uplift (%)
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
              placeholder="10"
              disabled
            />
          </label>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Form inputs are disabled in this MVP. Data is seeded from the database.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rf-button-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
