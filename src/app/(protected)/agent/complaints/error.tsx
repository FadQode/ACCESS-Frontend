"use client";

export default function AgentComplaintsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="max-w-md rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center">
        <h1 className="text-xl font-semibold text-[var(--rail-ink)]">
          Complaints could not load
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Please try opening the complaint list again.
        </p>
        <button
          className="mt-4 h-10 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white"
          onClick={reset}
          type="button"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
