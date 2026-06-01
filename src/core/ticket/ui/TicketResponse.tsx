import { CheckCircle2, Send } from "lucide-react";
import type { ResponseChannel } from "../model/ticket.types";

interface TicketResponseProps {
  responseDraft: string;
  responseChannel: ResponseChannel;
  hasSentResponse: boolean;
  onResponseDraftChange: (value: string) => void;
  onSendResponse: () => void;
}

export function TicketResponse({
  hasSentResponse,
  onResponseDraftChange,
  onSendResponse,
  responseChannel,
  responseDraft,
}: TicketResponseProps) {
  const characterCount = responseDraft.length;
  const canSend = responseDraft.trim().length > 0;

  return (
    <section className="p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
            Balasan Anda
          </h3>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            Balasan resmi ini akan dikirim kepada pelanggan.
          </p>
        </div>
        <label className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
          Kanal
          <select
            className="h-8 rounded-md border border-[var(--rail-border)] bg-[var(--background)] px-2 text-[11px] text-[var(--rail-ink)] outline-none focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
            defaultValue={responseChannel}
          >
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Tindak lanjut telepon</option>
          </select>
        </label>
      </div>

      <textarea
        className="h-[170px] w-full resize-none rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 py-2 text-sm leading-6 text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
        onChange={(event) => onResponseDraftChange(event.target.value)}
        placeholder="Tulis balasan resmi untuk keluhan ini..."
        value={responseDraft}
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span>{characterCount} karakter</span>
          <span aria-hidden="true">.</span>
          <span>Akan dikirim melalui {CHANNEL_LABELS[responseChannel]}</span>
          {hasSentResponse ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--signal-green-soft)] px-2 py-1 font-semibold text-[var(--signal-green-dark)]">
              <CheckCircle2 aria-hidden="true" size={12} />
              Terkirim
            </span>
          ) : null}
        </div>

        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[var(--signal-blue)] bg-[var(--signal-blue)] px-4 text-xs font-semibold text-white transition hover:bg-[#12486b] disabled:cursor-not-allowed disabled:border-[var(--rail-border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-tertiary)]"
          disabled={!canSend}
          onClick={onSendResponse}
          type="button"
        >
          <Send aria-hidden="true" size={14} />
          {hasSentResponse ? "Terkirim" : "Kirim balasan"}
        </button>
      </div>
    </section>
  );
}

const CHANNEL_LABELS: Record<ResponseChannel, string> = {
  email: "email",
  phone: "tindak lanjut telepon",
  whatsapp: "WhatsApp",
};
