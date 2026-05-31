const filterSkeletons = [
  "status-all",
  "status-pending",
  "status-progress",
  "status-info",
  "priority-high",
  "priority-risk",
];
const queueSkeletons = ["queue-1", "queue-2", "queue-3", "queue-4"];
const detailSkeletons = [
  "summary",
  "complaints",
  "context",
  "decision",
  "result",
];

export default function ManagerActionQueueLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <section className="mx-auto max-w-[1600px] rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
        <div className="mb-4 h-16 rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
        <div className="grid min-h-[720px] gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
            <div className="h-11 rounded-lg bg-[var(--background)]" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {filterSkeletons.map((item) => (
                <div
                  className="h-9 rounded-lg bg-[var(--background)]"
                  key={item}
                />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {queueSkeletons.map((item) => (
                <div
                  className="h-32 rounded-lg bg-[var(--background)]"
                  key={item}
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-44 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                {detailSkeletons.map((item) => (
                  <div
                    className="h-44 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]"
                    key={item}
                  />
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-56 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
                <div className="h-64 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
