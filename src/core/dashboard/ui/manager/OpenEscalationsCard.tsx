import type { OpenEscalationSummary } from "../../model/manager-dashboard.types";
import { OpenEscalationItem } from "./OpenEscalationItem";

interface OpenEscalationsCardProps {
  escalations: OpenEscalationSummary[];
}

export function OpenEscalationsCard({ escalations }: OpenEscalationsCardProps) {
  return (
    <section className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
            Open escalations
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Keluhan yang perlu perhatian manajer.
          </p>
        </div>
        <span className="rounded-full bg-[var(--signal-red-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--signal-red-dark)]">
          {escalations.length} terbuka
        </span>
      </div>
      <div className="grid gap-2">
        {escalations.map((escalation) => (
          <OpenEscalationItem escalation={escalation} key={escalation.id} />
        ))}
      </div>
    </section>
  );
}
