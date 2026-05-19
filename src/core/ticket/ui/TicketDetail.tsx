import type { ComposerMode, TicketDetailData } from "../model/ticket.types";
import { TicketHeader } from "./TicketHeader";
import { TicketResponse } from "./TicketResponse";
import { TicketThread } from "./TicketThread";

interface TicketDetailProps {
  ticket: TicketDetailData;
  replyMode: ComposerMode;
  replyText: string;
  onReplyModeChange: (mode: ComposerMode) => void;
  onReplyTextChange: (value: string) => void;
}

export function TicketDetail({
  onReplyModeChange,
  onReplyTextChange,
  replyMode,
  replyText,
  ticket,
}: TicketDetailProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)]">
      <TicketHeader ticket={ticket} />
      <TicketThread messages={ticket.messages} />
      <TicketResponse
        onReplyModeChange={onReplyModeChange}
        onReplyTextChange={onReplyTextChange}
        replyMode={replyMode}
        replyText={replyText}
      />
    </section>
  );
}
