import type {
  Ticket,
  TicketCategory,
  TicketStatus,
} from "../model/ticket.types";

interface TicketCardProps {
  ticket: Ticket;
  selected: boolean;
  onSelect: () => void;
}

export function TicketCard({ onSelect, selected, ticket }: TicketCardProps) {
  return (
    <button
      aria-pressed={selected}
      className={`w-full rounded-lg border p-3 text-left transition hover:border-[var(--signal-blue)] ${
        selected
          ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] shadow-[inset_3px_0_0_var(--signal-blue)]"
          : "border-[var(--rail-border)] bg-[var(--surface-panel)]"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass(
              ticket.status,
            )}`}
          />
          <span className="truncate text-xs font-semibold text-[var(--rail-ink)]">
            {ticket.customerName}
          </span>
        </div>
        <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">
          {ticket.referenceNumber.replace("ACC-2026-", "#")}
        </span>
      </div>
      <p className="mb-2 line-clamp-2 text-[11px] leading-5 text-[var(--text-muted)]">
        {ticket.complaintText}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass(
            ticket.category,
          )}`}
        >
          {CATEGORY_LABELS[ticket.category]}
        </span>
        <span className="text-[10px] text-[var(--text-tertiary)]">
          {ticket.relativeTime}
        </span>
      </div>
    </button>
  );
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  cancellation: "Cancellation",
  delay: "Delay",
  facility: "Facility",
  refund: "Refund",
  "lost-item": "Lost item",
  other: "Other",
  "seat-issue": "Seat issue",
};

export function categoryBadgeClass(category: TicketCategory) {
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

export function statusBadgeClass(status: TicketStatus) {
  const classes: Record<TicketStatus, string> = {
    escalated: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    new: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    open: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    resolved: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
  };

  return classes[status];
}

function statusDotClass(status: TicketStatus) {
  const classes: Record<TicketStatus, string> = {
    escalated: "bg-[var(--signal-red)]",
    new: "bg-[var(--signal-amber)]",
    open: "bg-[var(--signal-blue)]",
    resolved: "bg-[var(--signal-green)]",
  };

  return classes[status];
}
