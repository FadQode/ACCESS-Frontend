import type { OpenEscalationSummary } from "../../model/manager-dashboard.types";

interface OpenEscalationItemProps {
  escalation: OpenEscalationSummary;
}

export function OpenEscalationItem({ escalation }: OpenEscalationItemProps) {
  return (
    <article className="rounded-xl border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--rail-ink)]">
            {escalation.customerName}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
            {escalation.category} · ditangani {escalation.assignedAgent}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${urgencyClass(escalation.urgency)}`}
        >
          {escalation.relativeTime}
        </span>
      </div>
    </article>
  );
}

function urgencyClass(urgency: OpenEscalationSummary["urgency"]) {
  const classes: Record<OpenEscalationSummary["urgency"], string> = {
    high: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    low: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    medium: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  };

  return classes[urgency];
}
