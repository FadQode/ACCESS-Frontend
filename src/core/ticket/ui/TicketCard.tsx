import type {
  FollowUpTicket,
  FollowUpTicketCategory,
  FollowUpTicketStatus,
} from "../model/ticket.types";

interface TicketCardProps {
  ticket: FollowUpTicket;
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
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {ticket.status === "ready_to_notify" ? (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--signal-green)]" />
          ) : null}
          <span className="truncate text-xs font-semibold text-[var(--rail-ink)]">
            {ticket.customerName}
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-semibold text-[var(--text-tertiary)]">
          {ticket.displayId.replace("EXT-2026-", "#")}
        </span>
      </div>

      <p className="mb-2 line-clamp-2 text-[11px] leading-5 text-[var(--text-muted)]">
        {actionSummary(ticket)}
      </p>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <StatusBadge status={ticket.status} />
        <CategoryBadge category={ticket.category} />
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] text-[var(--text-tertiary)]">
        <span>{ticket.sourceLabel}</span>
        <span>{ticket.relativeTime}</span>
      </div>
    </button>
  );
}

export function StatusBadge({ status }: { status: FollowUpTicketStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(
        status,
      )}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function CategoryBadge({
  category,
}: {
  category: FollowUpTicketCategory;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass(
        category,
      )}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export const STATUS_LABELS: Record<FollowUpTicketStatus, string> = {
  closed: "Ditutup",
  escalated: "Dieskalasi",
  ready_to_notify: "Arahan Siap",
  waiting_manager: "Menunggu Manajer",
};

export const CATEGORY_LABELS: Record<FollowUpTicketCategory, string> = {
  app_issue: "Kendala Aplikasi",
  cancellation: "Pembatalan",
  delay: "Keterlambatan",
  facility: "Fasilitas",
  lost_item: "Barang Tertinggal",
  other: "Lainnya",
  payment: "Pembayaran",
  refund: "Pengembalian Dana",
};

export function statusBadgeClass(status: FollowUpTicketStatus) {
  const classes: Record<FollowUpTicketStatus, string> = {
    closed: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    escalated: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    ready_to_notify: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    waiting_manager:
      "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  };

  return classes[status];
}

export function categoryBadgeClass(category: FollowUpTicketCategory) {
  const classes: Record<FollowUpTicketCategory, string> = {
    app_issue: "bg-[#ede9fe] text-[#5b21b6]",
    cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    delay: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    facility: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    lost_item: "bg-[#ede9fe] text-[#5b21b6]",
    other: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    payment: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    refund: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  };

  return classes[category];
}

function actionSummary(ticket: FollowUpTicket) {
  if (ticket.status === "ready_to_notify") {
    return ticket.managerAction.closureDraft
      ? "Pesan penutup manager siap ditinjau dan disalin."
      : (ticket.managerAction.actionTaken ?? "Arahan manajer sudah selesai.");
  }

  if (ticket.status === "waiting_manager" || ticket.status === "escalated") {
    return "Menunggu arahan manajer sebelum pelanggan dikabari.";
  }

  return ticket.closureCopiedAt
    ? `Balasan akhir disalin ${ticket.closureCopiedAt}.`
    : "Tiket ditutup secara internal.";
}
