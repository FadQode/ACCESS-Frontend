"use client";

import { AlertCircle } from "lucide-react";

export default function AgentTicketsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <section className="mx-auto flex min-h-[520px] max-w-4xl items-center justify-center rounded-[22px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center shadow-[var(--shadow-soft)]">
        <div className="max-w-md">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]">
            <AlertCircle aria-hidden="true" size={22} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-[var(--rail-ink)]">
            Tickets gagal dimuat.
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            Silakan coba lagi.
          </p>
          <button
            className="mt-5 h-11 rounded-lg bg-[var(--rail-ink)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)]"
            onClick={reset}
            type="button"
          >
            Coba lagi
          </button>
        </div>
      </section>
    </main>
  );
}
