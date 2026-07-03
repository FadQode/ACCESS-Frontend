import { CalendarDays } from "lucide-react";

interface ManagerDashboardHeaderProps {
  from: string;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  to: string;
}

export function ManagerDashboardHeader({
  from,
  onFromChange,
  onToChange,
  to,
}: ManagerDashboardHeaderProps) {
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
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)]">
            <CalendarDays aria-hidden="true" size={15} />
            Rentang
          </span>
          <input
            aria-label="Dari tanggal"
            className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--rail-ink)] outline-none"
            onChange={(e) => onFromChange(e.target.value)}
            type="date"
            value={from}
          />
          <span className="text-xs text-[var(--text-muted)]">—</span>
          <input
            aria-label="Sampai tanggal"
            className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--rail-ink)] outline-none"
            onChange={(e) => onToChange(e.target.value)}
            type="date"
            value={to}
          />
        </div>
      </div>
    </header>
  );
}
