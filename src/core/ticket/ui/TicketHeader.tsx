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
          <span>Dibuka {ticket.openedAt}</span>
          <span aria-hidden="true">.</span>
          <span>ditugaskan ke {ticket.assignedAgent}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass(
              ticket.category,
            )}`}
          >
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </span>
          {ticket.escalated ? (
            <span className="rounded-full bg-[var(--signal-red-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--signal-red-dark)]">
              Dieskalasi
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
          Eskalasi
        </button>
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--signal-blue)] bg-[var(--signal-blue)] px-3 text-[11px] font-semibold text-white transition hover:bg-[#12486b]"
          onClick={() => console.log("Resolve ticket", ticket.id)}
          type="button"
        >
          <CircleCheck aria-hidden="true" size={14} />
          Selesaikan
        </button>
      </div>
    </header>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  account: "Login / OTP / Akun",
  app_error: "Aplikasi Error / Lemot",
  app_update: "Update Aplikasi",
  cancellation: "Pembatalan",
  delay: "Keterlambatan",
  facility: "Fasilitas",
  lost_item: "Barang Tertinggal",
  no_response_cs: "CS Tidak Merespons",
  payment: "Pembayaran",
  queue_problem: "Antrian / Promo",
  refund: "Pengembalian Dana",
  refund_cancel: "Refund / Pembatalan",
  ticket_booking: "Tiket / Booking",
  "lost-item": "Barang Tertinggal",
  other: "Lainnya",
  "seat-issue": "Masalah Kursi",
};

function categoryBadgeClass(category: TicketCategory) {
  const classes: Record<string, string> = {
    account: "bg-[#e9e4f4] text-[#5c4788]",
    app_error: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    app_update: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    delay: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    facility: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    lost_item: "bg-[#ede9fe] text-[#5b21b6]",
    no_response_cs: "bg-[#e9e4f4] text-[#5c4788]",
    payment: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    queue_problem:
      "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    refund: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    refund_cancel: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    ticket_booking: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    "lost-item": "bg-[#ede9fe] text-[#5b21b6]",
    other: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    "seat-issue": "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  };

  return classes[category] ?? classes.other;
}
