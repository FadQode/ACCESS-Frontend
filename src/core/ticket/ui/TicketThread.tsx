import type { TicketMessage as TicketMessageData } from "../model/ticket.types";
import { TicketMessage } from "./TicketMessage";

interface TicketThreadProps {
  messages: TicketMessageData[];
}

export function TicketThread({ messages }: TicketThreadProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[var(--background)] px-4 py-4">
      {messages.map((message) => (
        <TicketMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
