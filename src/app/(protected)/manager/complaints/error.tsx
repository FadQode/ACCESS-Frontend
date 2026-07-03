"use client";

export default function ManagerComplaintsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="max-w-md rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center">
        <h1 className="text-xl font-semibold text-[var(--rail-ink)]">
          Complaints gagal dimuat
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Coba buka ulang daftar complaint manager.
        </p>
        <button
          className="mt-4 h-10 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white"
          onClick={reset}
          type="button"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
