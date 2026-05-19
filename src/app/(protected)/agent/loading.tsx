export default function AgentLoading() {
  const metricSkeletons = [
    "first-response",
    "resolved",
    "active",
    "quality",
    "escalation",
    "oldest",
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-[1560px] gap-4">
        <div className="h-40 animate-pulse border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="h-80 animate-pulse border border-[var(--rail-border)] bg-[var(--rail-ink)]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {metricSkeletons.map((item) => (
              <div
                className="h-32 animate-pulse border border-[var(--rail-border)] bg-[var(--surface-panel)]"
                key={item}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
