import type { TicketActivityItem } from "../model/ticket.types";

interface TicketActivityLogProps {
  items: TicketActivityItem[];
}

export function TicketActivityLog({ items }: TicketActivityLogProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div className="flex gap-2" key={item.id}>
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${toneClass(
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
      ))}
    </div>
  );
}

function toneClass(tone: "danger" | "primary" | "muted") {
  const classes = {
    danger: "bg-[var(--signal-red)]",
    muted: "bg-[var(--text-tertiary)]",
    primary: "bg-[var(--signal-blue)]",
  };

  return classes[tone];
}
