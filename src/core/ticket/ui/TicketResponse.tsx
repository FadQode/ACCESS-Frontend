import { FileText, Languages, Paperclip, Send } from "lucide-react";
import type { ComposerMode } from "../model/ticket.types";

interface TicketResponseProps {
  replyMode: ComposerMode;
  replyText: string;
  onReplyModeChange: (mode: ComposerMode) => void;
  onReplyTextChange: (value: string) => void;
}

const MODES: Array<{ label: string; value: ComposerMode }> = [
  { label: "Reply", value: "reply" },
  { label: "Internal note", value: "internal-note" },
];

export function TicketResponse({
  onReplyModeChange,
  onReplyTextChange,
  replyMode,
  replyText,
}: TicketResponseProps) {
  return (
    <section className="shrink-0 border-t border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3">
      <div className="mb-2 flex gap-1">
        {MODES.map((mode) => (
          <button
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
              replyMode === mode.value
                ? "border-[var(--signal-blue)] bg-[var(--signal-blue)] text-white"
                : "border-[var(--rail-border)] text-[var(--text-muted)] hover:border-[var(--signal-blue)]"
            }`}
            key={mode.value}
            onClick={() => onReplyModeChange(mode.value)}
            type="button"
          >
            {mode.label}
          </button>
        ))}
      </div>

      <textarea
        className="h-[76px] w-full resize-none rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 py-2 text-xs leading-5 text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
        onChange={(event) => onReplyTextChange(event.target.value)}
        placeholder={
          replyMode === "reply"
            ? "Write your reply to the customer..."
            : "Add an internal note for the support team..."
        }
        value={replyText}
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <IconButton label="Attach file">
            <Paperclip aria-hidden="true" size={16} />
          </IconButton>
          <IconButton label="Use template">
            <FileText aria-hidden="true" size={16} />
          </IconButton>
          <IconButton label="Translate">
            <Languages aria-hidden="true" size={16} />
          </IconButton>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="h-8 rounded-md border border-[var(--rail-border)] px-3 text-xs font-semibold text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)]"
            type="button"
          >
            Draft
          </button>
          <button
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--signal-blue)] bg-[var(--signal-blue)] px-3 text-xs font-semibold text-white transition hover:bg-[#12486b]"
            type="button"
          >
            <Send aria-hidden="true" size={13} />
            Send
          </button>
        </div>
      </div>
    </section>
  );
}

function IconButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--background)] hover:text-[var(--signal-blue)]"
      type="button"
    >
      {children}
    </button>
  );
}
