import type { ComplaintTrendPoint } from "../../model/types/dashboard.types";
import type { ReportGroupBy } from "../../model/types/dashboard-filter.types";
import { ComplaintTrendChart } from "./ComplaintTrendChart";

interface ComplaintTrendCardProps {
  data: ComplaintTrendPoint[];
  groupBy: ReportGroupBy;
  onGroupByChange: (groupBy: ReportGroupBy) => void;
}

const GROUP_OPTIONS: { label: string; value: ReportGroupBy }[] = [
  { label: "Harian", value: "day" },
  { label: "Mingguan", value: "week" },
];

export function ComplaintTrendCard({
  data,
  groupBy,
  onGroupByChange,
}: ComplaintTrendCardProps) {
  return (
    <section className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
            Complaint trend
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Keluhan masuk, selesai, dan dieskalasi.
          </p>
        </div>
        <div className="flex w-fit rounded-full border border-[var(--rail-border)] bg-[var(--background)] p-1">
          {GROUP_OPTIONS.map((item) => (
            <button
              className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                groupBy === item.value
                  ? "bg-[var(--surface-panel)] text-[var(--rail-ink)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--rail-ink)]"
              }`}
              key={item.value}
              onClick={() => onGroupByChange(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4">
        <Legend color="var(--signal-blue)" label="Masuk" />
        <Legend color="var(--signal-green)" label="Selesai" />
        <Legend color="var(--signal-red)" label="Dieskalasi" />
      </div>
      <ComplaintTrendChart data={data} />
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
