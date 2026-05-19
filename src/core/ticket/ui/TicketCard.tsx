import type {
  TicketCategory,
  TicketDetailData,
  TicketPriority,
} from "../model/ticket.types";

interface TicketCardProps {
  ticket: TicketDetailData;
  selected: boolean;
  onSelect: () => void;
}

export function TicketCard({ onSelect, selected, ticket }: TicketCardProps) {
  return (
    <button
      aria-pressed={selected}
      className={`w-full rounded-lg border p-3 text-left transition hover:border-[var(--signal-blue)] ${
        selected
          ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)]"
          : "border-[var(--rail-border)] bg-[var(--surface-panel)]"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDotClass(
              ticket.priority,
            )}`}
          />
          <span className="truncate text-xs font-semibold text-[var(--rail-ink)]">
            {ticket.customerName}
          </span>
        </div>
        <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">
          {ticket.id}
        </span>
      </div>
      <p className="mb-2 truncate text-[11px] leading-5 text-[var(--text-muted)]">
        {ticket.preview}
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

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  cancellation: "Cancellation",
  delay: "Delay",
  facility: "Facility",
  refund: "Refund",
  "lost-item": "Lost item",
  "seat-issue": "Seat issue",
};

function categoryBadgeClass(category: TicketCategory) {
  const classes: Record<TicketCategory, string> = {
    cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    delay: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    facility: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    refund: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    "lost-item": "bg-[#ede9fe] text-[#5b21b6]",
    "seat-issue": "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  };

  return classes[category];
}

function priorityDotClass(priority: TicketPriority) {
  const classes: Record<TicketPriority, string> = {
    high: "bg-[var(--signal-red)]",
    low: "bg-[var(--signal-green)]",
    medium: "bg-[var(--signal-amber)]",
  };

  return classes[priority];
}
