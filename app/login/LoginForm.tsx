"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, teamCode })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Login failed.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Login failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rf-card space-y-4">
      <div className="space-y-2">
        <label className="block text-sm text-slate-600">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            placeholder="name@company.com"
            required
          />
        </label>
        <label className="block text-sm text-slate-600">
          Team code
          <input
            type="text"
            value={teamCode}
            onChange={(event) => setTeamCode(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            placeholder="Enter your team code"
            required
          />
        </label>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button type="submit" className="rf-button" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
