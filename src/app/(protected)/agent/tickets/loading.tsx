const ticketSkeletons = ["ticket-1", "ticket-2", "ticket-3", "ticket-4"];
const detailSkeletons = ["complaint", "safe-reply", "manager", "closure"];

export default function AgentTicketsLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <section className="mx-auto max-w-[1600px] rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
        <div className="mb-4 h-16 rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
        <div className="grid min-h-[700px] gap-0 overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] xl:grid-cols-[320px_minmax(0,1fr)_300px]">
          <div className="border-b border-[var(--rail-border)] p-4 xl:border-b-0 xl:border-r">
            <div className="h-10 rounded-lg bg-[var(--background)]" />
            <div className="mt-4 space-y-3">
              {ticketSkeletons.map((item) => (
                <div
                  className="h-32 rounded-lg bg-[var(--background)]"
                  key={item}
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 bg-[var(--background)] p-4">
            {detailSkeletons.map((item) => (
              <div
                className="h-44 rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)]"
                key={item}
              />
            ))}
          </div>
          <div className="space-y-3 border-t border-[var(--rail-border)] p-4 xl:border-l xl:border-t-0">
            <div className="h-32 rounded-lg bg-[var(--background)]" />
            <div className="h-32 rounded-lg bg-[var(--background)]" />
            <div className="h-56 rounded-lg bg-[var(--background)]" />
          </div>
        </div>
      </section>
    </main>
  );
}
