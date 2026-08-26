const relativeFormatter = new Intl.RelativeTimeFormat("id-ID", {
  numeric: "auto",
});

/** ponytail: lives here instead of a new quick-response/utils folder — this
 * is already the shared home for date formatting helpers. */
export function formatRelativeTimeId(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return "-";
  }

  const diffMinutes = Math.round((timestamp - Date.now()) / 60_000);

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round((timestamp - Date.now()) / 3_600_000);

  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour");
  }

  return relativeFormatter.format(
    Math.round((timestamp - Date.now()) / 86_400_000),
    "day",
  );
}

function toDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDefaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  return { from: toDateInput(from), to: toDateInput(to) };
}
