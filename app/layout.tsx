import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resolution-First",
  description: "A resolution-first decision flow MVP."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
          <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div>
                <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
                  Resolution-First
                </Link>
                <p className="text-xs text-slate-500">
                  Resolution-first decisions with calm, focused rituals.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="rf-button-secondary">
                  Dashboard
                </Link>
                <Link href="/wizard" className="rf-button">
                  Decision Gate
                </Link>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
