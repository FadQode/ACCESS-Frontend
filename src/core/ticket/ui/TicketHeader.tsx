import { AlertTriangle, CircleCheck } from "lucide-react";
import type { TicketCategory, TicketDetailData } from "../model/ticket.types";

interface TicketHeaderProps {
  ticket: TicketDetailData;
}

export function TicketHeader({ ticket }: TicketHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--signal-blue)] text-[10px] font-semibold text-white">
        {ticket.customer.initials}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-[var(--rail-ink)]">
          {ticket.customerName}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <span>Opened {ticket.openedAt}</span>
          <span aria-hidden="true">.</span>
          <span>assigned to {ticket.assignedAgent}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass(
              ticket.category,
            )}`}
          >
            {CATEGORY_LABELS[ticket.category]}
          </span>
          {ticket.escalated ? (
            <span className="rounded-full bg-[var(--signal-red-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--signal-red-dark)]">
              Escalated
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--signal-red-soft)] px-3 text-[11px] font-semibold text-[var(--signal-red-dark)] transition hover:border-[var(--signal-red)]"
          onClick={() => console.log("Escalate ticket", ticket.id)}
          type="button"
        >
          <AlertTriangle aria-hidden="true" size={14} />
          Escalate
        </button>
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--signal-blue)] bg-[var(--signal-blue)] px-3 text-[11px] font-semibold text-white transition hover:bg-[#12486b]"
          onClick={() => console.log("Resolve ticket", ticket.id)}
          type="button"
        >
          <CircleCheck aria-hidden="true" size={14} />
          Resolve
        </button>
      </div>
    </header>
  );
}

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  cancellation: "Cancellation",
  delay: "Delay",
  facility: "Facility",
  refund: "Refund",
  "lost-item": "Lost item",
  other: "Other",
  "seat-issue": "Seat issue",
};

function categoryBadgeClass(category: TicketCategory) {
  const classes: Record<TicketCategory, string> = {
    cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    delay: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    facility: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    refund: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    "lost-item": "bg-[#ede9fe] text-[#5b21b6]",
    other: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    "seat-issue": "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  };

  return classes[category];
}
