"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AgentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
      <section className="w-full max-w-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 shadow-[var(--shadow-ops)]">
        <div className="flex items-center gap-3 text-[var(--signal-red)]">
          <AlertTriangle aria-hidden="true" size={22} />
          <p className="text-xs font-bold uppercase tracking-[0.24em]">
            Service Console Error
          </p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--rail-ink)]">
          The performance board could not load.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          {error.message ||
            "Refresh the dashboard to request a new performance snapshot."}
        </p>
        <button
          className="mt-6 inline-flex h-11 items-center gap-2 border border-[var(--rail-ink)] bg-[var(--rail-ink)] px-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[var(--signal-blue)]"
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={16} />
          Retry
        </button>
      </section>
    </main>
  );
}
