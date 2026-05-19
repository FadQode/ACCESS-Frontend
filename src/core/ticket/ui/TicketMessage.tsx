import { ArrowUpRight } from "lucide-react";
import type { TicketMessage as TicketMessageData } from "../model/ticket.types";

interface TicketMessageProps {
  message: TicketMessageData;
}

export function TicketMessage({ message }: TicketMessageProps) {
  if (message.senderType === "system") {
    return (
      <div className="self-center text-center">
        <div className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
          <ArrowUpRight aria-hidden="true" size={12} />
          <span>
            {message.content} · {message.time}
          </span>
        </div>
      </div>
    );
  }

  const isAgent = message.senderType === "agent";

  return (
    <article className={`max-w-[80%] ${isAgent ? "self-end" : "self-start"}`}>
      <p
        className={`mb-1 text-[10px] text-[var(--text-muted)] ${
          isAgent ? "text-right" : ""
        }`}
      >
        {message.senderName}
      </p>
      <div
        className={`rounded-xl px-3 py-2 text-xs leading-6 ${
          isAgent
            ? "rounded-tr-sm bg-[var(--signal-blue)] text-white"
            : "rounded-tl-sm border border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--rail-ink)]"
        }`}
      >
        {message.content}
      </div>
      <p
        className={`mt-1 text-[10px] text-[var(--text-tertiary)] ${
          isAgent ? "text-right" : ""
        }`}
      >
        {message.time}
      </p>
    </article>
  );
}
