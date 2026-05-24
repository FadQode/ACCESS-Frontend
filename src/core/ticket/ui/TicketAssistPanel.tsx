import {
  Activity,
  ClipboardCheck,
  Lightbulb,
  Sparkles,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Ticket, TicketActivity } from "../model/ticket.types";

interface TicketAssistPanelProps {
  ticket: Ticket;
  suggestionApplied: boolean;
  onUseSuggestedResponse: () => void;
}

export function TicketAssistPanel({
  onUseSuggestedResponse,
  suggestionApplied,
  ticket,
}: TicketAssistPanelProps) {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[var(--rail-border)] bg-[var(--surface-panel)] xl:w-[268px] xl:border-l xl:border-t-0">
      <header className="flex items-center gap-2 border-b border-[var(--rail-border)] px-3.5 py-3">
        <Sparkles
          aria-hidden="true"
          className="text-[var(--signal-blue)]"
          size={16}
        />
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-[var(--rail-ink)]">
            AI assist
          </h2>
          <p className="text-[10px] text-[var(--text-muted)]">
            SOP-backed response context
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <AssistCard
          icon={<User aria-hidden="true" size={15} />}
          title="Complainer"
        >
          <InfoRow label="Name" value={ticket.customerName} />
          <InfoRow label="Contact" value={ticket.contact} />
          <InfoRow label="Channel" value={channelLabel(ticket.channel)} />
          <InfoRow label="Past complaints" value={ticket.pastComplaints} />
        </AssistCard>

        <AssistCard
          icon={<ClipboardCheck aria-hidden="true" size={15} />}
          title="Context found"
        >
          <InfoRow label="SOP" value={ticket.sopContext.title} />
          <InfoRow label="Issue" value={ticket.sopContext.issue} />
          {ticket.sopContext.disruptionKnown ? (
            <InfoRow
              label="Disruption"
              value={ticket.sopContext.disruptionKnown}
            />
          ) : null}
          {ticket.sopContext.eligibility ? (
            <InfoRow
              label="Eligible for"
              value={ticket.sopContext.eligibility}
            />
          ) : null}
          {ticket.sopContext.policyNote ? (
            <p className="mt-2 rounded-md bg-[var(--background)] p-2 text-[11px] leading-5 text-[var(--text-muted)]">
              {ticket.sopContext.policyNote}
            </p>
          ) : null}
        </AssistCard>

        <AssistCard
          icon={<Lightbulb aria-hidden="true" size={15} />}
          title="Suggested response"
        >
          <p className="text-[11px] leading-5 text-[var(--text-muted)]">
            Based on the related SOP, this response acknowledges the complaint,
            explains the context, and offers the next concrete option.
          </p>
          <p className="mt-2 rounded-md border border-[#b5d4f4] bg-[#f8fbff] p-2 text-[11px] leading-5 text-[#185fa5]">
            {ticket.suggestedResponse}
          </p>
          <button
            className="mt-2 h-8 w-full rounded-md border border-[var(--signal-blue)] text-[11px] font-semibold text-[var(--signal-blue)] transition hover:bg-[var(--signal-blue-soft)]"
            onClick={onUseSuggestedResponse}
            type="button"
          >
            {suggestionApplied ? "Applied" : "Use this response"}
          </button>
        </AssistCard>

        <AssistCard
          icon={<Activity aria-hidden="true" size={15} />}
          title="Activity"
        >
          <div className="space-y-2">
            {ticket.activityLog.map((item) => (
              <ActivityItem item={item} key={item.id} />
            ))}
          </div>
        </AssistCard>
      </div>
    </aside>
  );
}

function AssistCard({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--rail-border)] bg-[var(--background)] px-2.5 py-2 text-[var(--text-muted)]">
        {icon}
        <h3 className="text-[11px] font-semibold text-[var(--rail-ink)]">
          {title}
        </h3>
      </div>
      <div className="p-2.5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 flex items-start justify-between gap-2 last:mb-0">
      <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="text-right text-[11px] font-semibold leading-5 text-[var(--rail-ink)]">
        {value}
      </span>
    </div>
  );
}

function ActivityItem({ item }: { item: TicketActivity }) {
  return (
    <div className="flex gap-2">
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${activityToneClass(
          item.tone ?? "muted",
        )}`}
      />
      <div className="min-w-0">
        <p className="text-[11px] leading-4 text-[var(--text-muted)]">
          {item.label}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">
          {item.time} · {item.actor}
        </p>
      </div>
    </div>
  );
}

function activityToneClass(tone: NonNullable<TicketActivity["tone"]>) {
  const classes: Record<NonNullable<TicketActivity["tone"]>, string> = {
    danger: "bg-[var(--signal-red)]",
    muted: "bg-[var(--text-tertiary)]",
    primary: "bg-[var(--signal-blue)]",
    success: "bg-[var(--signal-green)]",
    warning: "bg-[var(--signal-amber)]",
  };

  return classes[tone];
}

function channelLabel(channel: Ticket["channel"]) {
  const labels: Record<Ticket["channel"], string> = {
    email: "Email",
    manual: "Manual",
    "quick-response": "Quick response",
    "web-form": "Web form",
  };

  return labels[channel];
}
