"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ResolutionUploadFormProps {
  decisionId: string;
}

export default function ResolutionUploadForm({ decisionId }: ResolutionUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<
    { sampleSize: number; uplift: number; outcome: string } | null
  >(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/decisions/${decisionId}/resolve`, {
        method: "POST",
        body: formData
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to resolve decision.");
      }

      setResult(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Upload CSV
          <input
            type="file"
            accept=".csv"
            className="mt-2 block w-full text-sm text-slate-700"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <button type="submit" className="rf-button" disabled={isSubmitting}>
          {isSubmitting ? "Resolving..." : "Resolve decision"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      {result ? (
        <p className="mt-2 text-sm text-slate-600">
          Calculated uplift: {result.uplift}% · Outcome: {result.outcome} · Sample size: {result.sampleSize}
        </p>
      ) : null}
    </form>
  );
}
