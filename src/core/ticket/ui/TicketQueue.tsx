import { Search } from "lucide-react";
import type {
  FollowUpTicket,
  FollowUpTicketFilter,
} from "../model/ticket.types";
import { TicketCard } from "./TicketCard";

interface TicketQueueProps {
  tickets: FollowUpTicket[];
  selectedTicketId: string;
  filter: FollowUpTicketFilter;
  readyCount: number;
  waitingCount: number;
  searchQuery: string;
  onFilterChange: (filter: FollowUpTicketFilter) => void;
  onSearchChange: (value: string) => void;
  onSelectTicket: (ticketId: string) => void;
}

const filters: Array<{ label: string; value: FollowUpTicketFilter }> = [
  { label: "Semua", value: "all" },
  { label: "Menunggu", value: "waiting" },
  { label: "Siap", value: "ready" },
  { label: "Tutup", value: "closed" },
];

export function TicketQueue({
  filter,
  onFilterChange,
  onSearchChange,
  onSelectTicket,
  readyCount,
  searchQuery,
  selectedTicketId,
  tickets,
  waitingCount,
}: TicketQueueProps) {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-[var(--rail-border)] bg-[var(--surface-panel)] xl:w-[320px] xl:border-b-0 xl:border-r">
      <div className="border-b border-[var(--rail-border)] p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--rail-ink)]">
              Tickets
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Kasus eksternal yang masih butuh tindak lanjut internal.
            </p>
          </div>
          <span className="rounded-full bg-[var(--signal-green-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--signal-green-dark)]">
            {readyCount} siap
          </span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <QueueMetric label="Siap" value={readyCount} />
          <QueueMetric label="Menunggu" value={waitingCount} />
        </div>

        <label className="relative mb-3 block">
          <span className="sr-only">Cari tiket lanjutan</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            size={14}
          />
          <input
            className="h-10 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-xs text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama, handle, tiket, tindakan..."
            type="search"
            value={searchQuery}
          />
        </label>

        <div className="grid grid-cols-4 gap-1.5">
          {filters.map((item) => (
            <button
              className={`min-h-8 rounded-lg border px-2 text-[11px] font-semibold transition ${
                filter === item.value
                  ? "border-[var(--signal-blue)] bg-[var(--signal-blue)] text-white"
                  : "border-[var(--rail-border)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              }`}
              key={item.value}
              onClick={() => onFilterChange(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              onSelect={() => onSelectTicket(ticket.id)}
              selected={ticket.id === selectedTicketId}
              ticket={ticket}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--rail-border)] p-3 text-xs leading-5 text-[var(--text-muted)]">
            Tidak ada tiket lanjutan yang cocok dengan pencarian ini.
          </p>
        )}
      </div>
    </aside>
  );
}

function QueueMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}
