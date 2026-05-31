const stepSkeletons = ["input", "build", "review", "outcome"];

export default function QuickResponseLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <section className="mx-auto max-w-[1600px] rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
        <div className="mb-4 h-16 rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
        <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex max-w-[880px] flex-col gap-3">
            <div className="mb-2 h-8 rounded-lg bg-[var(--background)]" />
            {stepSkeletons.map((item) => (
              <div
                className="h-44 rounded-xl border border-[var(--rail-border)] bg-[var(--background)]"
                key={item}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
