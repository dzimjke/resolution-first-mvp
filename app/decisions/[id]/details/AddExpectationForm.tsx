"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["PRODUCT", "ANALYTICS", "ENGINEERING", "GROWTH", "OTHER"] as const;
const CHOICES = ["YES", "NO", "UNRESOLVED"] as const;

type Role = (typeof ROLES)[number];
type Choice = (typeof CHOICES)[number];

interface AddExpectationFormProps {
  decisionId: string;
}

export default function AddExpectationForm({ decisionId }: AddExpectationFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PRODUCT");
  const [choice, setChoice] = useState<Choice>("YES");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/decisions/${decisionId}/expectations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          choice,
          comment: comment.trim().length > 0 ? comment : null
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add expectation.");
      }

      setComment("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expectation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Role
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          >
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Choice
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            value={choice}
            onChange={(event) => setChoice(event.target.value as Choice)}
          >
            {CHOICES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-medium uppercase tracking-wide text-slate-500 md:col-span-3">
          Comment (optional)
          <textarea
            className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            value={comment}
            maxLength={280}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Short context or concerns (max 280 chars)."
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" className="rf-button" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add expectation"}
        </button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </form>
  );
}
