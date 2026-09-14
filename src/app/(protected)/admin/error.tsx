"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
      <section className="w-full max-w-xl rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 text-[var(--signal-red)]">
          <AlertTriangle aria-hidden="true" size={22} />
          <p className="text-xs font-bold uppercase tracking-[0.24em]">
            Admin Console Error
          </p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--rail-ink)]">
          Admin console gagal dimuat.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          {error.message ||
            "Muat ulang halaman untuk mengambil data admin terbaru."}
        </p>
        <button
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--rail-ink)] bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)]"
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={16} />
          Coba lagi
        </button>
      </section>
    </main>
  );
}
