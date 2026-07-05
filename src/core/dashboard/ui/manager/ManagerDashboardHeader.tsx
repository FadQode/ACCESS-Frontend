export function ManagerDashboardHeader() {
  return (
    <header className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
          ACCESS · operations
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight text-[var(--rail-ink)]">
          Overview operasional
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
          Ringkasan cepat untuk total keluhan, penyelesaian, eskalasi, tren
          komplain, dan distribusi kategori.
        </p>
      </div>
    </header>
  );
}
