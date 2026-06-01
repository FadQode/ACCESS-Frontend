import { MessageSquareText } from "lucide-react";
import type { TicketSuggestedResponse } from "../model/ticket.types";

interface SuggestedResponseCardProps {
  suggestedResponse: TicketSuggestedResponse;
  onUseSuggestedResponse: () => void;
}

export function SuggestedResponseCard({
  onUseSuggestedResponse,
  suggestedResponse,
}: SuggestedResponseCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#b5d4f4] bg-[#f8fbff]">
      <div className="flex items-center gap-1.5 border-b border-[#b5d4f4] bg-[#e6f1fb] px-2.5 py-2 text-[#185fa5]">
        <MessageSquareText aria-hidden="true" size={15} />
        <h3 className="text-[11px] font-semibold text-[#0c447c]">
          {suggestedResponse.title}
        </h3>
      </div>
      <div className="p-2.5">
        <p className="mb-2 text-[11px] leading-5 text-[#185fa5]">
          {suggestedResponse.content}
        </p>
        <button
          className="h-8 w-full rounded-md border border-[#185fa5] text-[11px] font-semibold text-[#185fa5] transition hover:bg-[#e6f1fb]"
          onClick={onUseSuggestedResponse}
          type="button"
        >
          Gunakan balasan ini
        </button>
      </div>
    </article>
  );
}
