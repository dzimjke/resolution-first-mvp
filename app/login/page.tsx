import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { getCurrentMember } from "@/lib/session";

export default async function LoginPage() {
  const member = await getCurrentMember();

  if (member) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="rf-card space-y-2">
        <p className="rf-pill">Sign In</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Access your team workspace
        </h1>
        <p className="text-sm text-slate-600">
          Enter your email and team code to continue.
        </p>
      </section>
      <LoginForm />
    </div>
  );
}
