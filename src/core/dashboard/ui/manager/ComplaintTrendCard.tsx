import type {
  ComplaintTrendPoint,
  TrendInterval,
} from "../../model/manager-dashboard.types";
import { ComplaintTrendChart } from "./ComplaintTrendChart";

interface ComplaintTrendCardProps {
  data: ComplaintTrendPoint[];
  interval: TrendInterval;
  onIntervalChange: (interval: TrendInterval) => void;
}

const INTERVALS: { label: string; value: TrendInterval }[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
];

export function ComplaintTrendCard({
  data,
  interval,
  onIntervalChange,
}: ComplaintTrendCardProps) {
  return (
    <section className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
            Complaint trend
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Incoming, resolved, and escalated complaints.
          </p>
        </div>
        <div className="flex w-fit rounded-full border border-[var(--rail-border)] bg-[var(--background)] p-1">
          {INTERVALS.map((item) => (
            <button
              className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                interval === item.value
                  ? "bg-[var(--surface-panel)] text-[var(--rail-ink)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--rail-ink)]"
              }`}
              key={item.value}
              onClick={() => onIntervalChange(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4">
        <Legend color="var(--signal-blue)" label="Incoming" />
        <Legend color="var(--signal-green)" label="Resolved" />
        <Legend color="var(--signal-red)" label="Escalated" />
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
