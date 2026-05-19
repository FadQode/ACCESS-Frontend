import { Sparkles } from "lucide-react";
import type { TicketDetailData } from "../model/ticket.types";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { ServiceContextCard } from "./ServiceContextCard";
import { SuggestedResponseCard } from "./SuggestedResponseCard";
import { TicketActivityLog } from "./TicketActivityLog";

interface TicketAssistPanelProps {
  ticket: TicketDetailData;
  onUseSuggestedResponse: () => void;
}

export function TicketAssistPanel({
  onUseSuggestedResponse,
  ticket,
}: TicketAssistPanelProps) {
  return (
    <aside className="flex min-h-0 w-[244px] shrink-0 flex-col overflow-hidden border-l border-[var(--rail-border)] bg-[var(--surface-panel)]">
      <header className="flex items-center gap-2 border-b border-[var(--rail-border)] px-3.5 py-3">
        <Sparkles
          aria-hidden="true"
          className="text-[var(--signal-blue)]"
          size={16}
        />
        <h2 className="text-xs font-semibold text-[var(--rail-ink)]">
          AI assist
        </h2>
        <span className="rounded-full bg-[var(--signal-blue-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--signal-blue)]">
          auto
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <AssistSection title="Complainer info">
          <CustomerInfoCard customer={ticket.customer} />
        </AssistSection>
        <AssistSection title="Relevant context">
          <ServiceContextCard context={ticket.serviceContext} />
        </AssistSection>
        <AssistSection title="Suggested response">
          <SuggestedResponseCard
            onUseSuggestedResponse={onUseSuggestedResponse}
            suggestedResponse={ticket.suggestedResponse}
          />
        </AssistSection>
        <AssistSection title="Activity log">
          <TicketActivityLog items={ticket.activityLog} />
        </AssistSection>
      </div>
    </aside>
  );
}

function AssistSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section>
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
