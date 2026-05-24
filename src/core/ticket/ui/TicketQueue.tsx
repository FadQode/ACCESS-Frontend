import { Search } from "lucide-react";
import type { Ticket, TicketFilter } from "../model/ticket.types";
import { TicketCard } from "./TicketCard";

interface TicketQueueProps {
  tickets: Ticket[];
  selectedTicketId: string;
  filter: TicketFilter;
  openTicketCount: number;
  searchQuery: string;
  onFilterChange: (filter: TicketFilter) => void;
  onSearchChange: (value: string) => void;
  onSelectTicket: (ticketId: string) => void;
}

const FILTERS: Array<{ label: string; value: TicketFilter }> = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
  { label: "Escalated", value: "escalated" },
];

export function TicketQueue({
  filter,
  onFilterChange,
  onSearchChange,
  onSelectTicket,
  openTicketCount,
  searchQuery,
  selectedTicketId,
  tickets,
}: TicketQueueProps) {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-[var(--rail-border)] bg-[var(--surface-panel)] xl:w-[280px] xl:border-b-0 xl:border-r">
      <div className="border-b border-[var(--rail-border)] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
              Tickets
            </h2>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              Complaint review queue
            </p>
          </div>
          <span className="rounded-full bg-[var(--signal-blue-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--signal-blue)]">
            {openTicketCount} active
          </span>
        </div>

        <label className="relative mb-2 block">
          <span className="sr-only">Search tickets</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            size={14}
          />
          <input
            className="h-8 w-full rounded-md border border-[var(--rail-border)] bg-[var(--background)] pl-8 pr-3 text-xs text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, ref, issue..."
            type="search"
            value={searchQuery}
          />
        </label>

        <div className="flex flex-wrap gap-1">
          {FILTERS.map((item) => (
            <button
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                filter === item.value
                  ? "border-[var(--signal-blue)] bg-[var(--signal-blue)] text-white"
                  : "border-[var(--rail-border)] text-[var(--text-muted)] hover:border-[var(--signal-blue)]"
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

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2">
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
            No complaints match this search.
          </p>
        )}
      </div>
    </aside>
  );
}
