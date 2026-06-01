import { CalendarDays } from "lucide-react";
import type { DashboardPeriod } from "../../model/manager-dashboard.types";

interface ManagerDashboardHeaderProps {
  onPeriodChange: (period: DashboardPeriod) => void;
  period: DashboardPeriod;
}

const PERIODS: { label: string; value: DashboardPeriod }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

export function ManagerDashboardHeader({
  onPeriodChange,
  period,
}: ManagerDashboardHeaderProps) {
  return (
    <header className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
            ACCESS · operations
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-[var(--rail-ink)]">
            Manager overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            Kondisi keluhan, performa tim, dan eskalasi dalam satu tampilan
            ringkas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)]">
            <CalendarDays aria-hidden="true" size={15} />
            Periode
          </span>
          <div className="flex rounded-full border border-[var(--rail-border)] bg-[var(--background)] p-1">
            {PERIODS.map((item) => (
              <button
                className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                  period === item.value
                    ? "bg-[var(--rail-ink)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--rail-ink)]"
                }`}
                key={item.value}
                onClick={() => onPeriodChange(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
