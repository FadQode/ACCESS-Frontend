import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Mail,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Ticket } from "../model/ticket.types";
import {
  CATEGORY_LABELS,
  categoryBadgeClass,
  statusBadgeClass,
} from "./TicketCard";
import { TicketResponse } from "./TicketResponse";

interface TicketDetailProps {
  ticket: Ticket;
  responseDraft: string;
  hasSentResponse: boolean;
  onResponseDraftChange: (value: string) => void;
  onSendResponse: () => void;
  onEscalate: () => void;
  onResolve: () => void;
}

export function TicketDetail({
  hasSentResponse,
  onEscalate,
  onResolve,
  onResponseDraftChange,
  onSendResponse,
  responseDraft,
  ticket,
}: TicketDetailProps) {
  return (
    <section className="flex min-h-[620px] min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)] xl:min-h-0">
      <header className="shrink-0 border-b border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--signal-blue)] text-xs font-semibold text-white">
              {ticket.customerInitials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-[var(--rail-ink)]">
                {ticket.customerName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadgeClass(
                    ticket.category,
                  )}`}
                >
                  {CATEGORY_LABELS[ticket.category]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusBadgeClass(
                    ticket.status,
                  )}`}
                >
                  {ticket.status}
                </span>
                <span>{ticket.referenceNumber}</span>
                <span aria-hidden="true">.</span>
                <span>submitted {ticket.relativeTime}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--signal-red-soft)] px-3 text-[11px] font-semibold text-[var(--signal-red-dark)] transition hover:border-[var(--signal-red)]"
              onClick={onEscalate}
              type="button"
            >
              <AlertTriangle aria-hidden="true" size={14} />
              Escalate
            </button>
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--signal-green)] px-3 text-[11px] font-semibold text-[var(--signal-green-dark)] transition hover:bg-[var(--signal-green-soft)]"
              onClick={onResolve}
              type="button"
            >
              <CheckCircle2 aria-hidden="true" size={14} />
              Resolve
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <article className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--rail-border)] px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-[var(--rail-ink)]">
                Complaint submitted via {channelLabel(ticket.channel)}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                Original customer submission
              </p>
            </div>
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
              {ticket.submittedAt}
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm leading-7 text-[var(--rail-ink)]">
              {ticket.complaintText}
            </p>

            <dl className="mt-4 grid gap-2 border-t border-[var(--rail-border)] pt-4 text-xs sm:grid-cols-3">
              <MetadataItem
                icon={<UserRound aria-hidden="true" size={14} />}
                label="Name"
                value={ticket.customerName}
              />
              <MetadataItem
                icon={<Mail aria-hidden="true" size={14} />}
                label="Contact"
                value={ticket.contact}
              />
              <MetadataItem
                icon={<Clock3 aria-hidden="true" size={14} />}
                label="Submitted"
                value={ticket.submittedAt}
              />
            </dl>
          </div>
        </article>

        <div className="mt-4 rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
          <TicketResponse
            hasSentResponse={hasSentResponse}
            onResponseDraftChange={onResponseDraftChange}
            onSendResponse={onSendResponse}
            responseChannel={ticket.responseChannel}
            responseDraft={responseDraft}
          />
        </div>
      </div>
    </section>
  );
}

function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg bg-[var(--background)] p-3">
      <span className="mt-0.5 shrink-0 text-[var(--signal-blue)]">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">
          {label}
        </dt>
        <dd className="mt-1 break-words font-semibold text-[var(--rail-ink)]">
          {value}
        </dd>
      </div>
    </div>
  );
}

function channelLabel(channel: Ticket["channel"]) {
  const labels: Record<Ticket["channel"], string> = {
    email: "email",
    manual: "manual entry",
    "quick-response": "quick response form",
    "web-form": "web form",
  };

  return labels[channel];
}
