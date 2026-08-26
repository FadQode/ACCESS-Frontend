/**
 * Pure date/format helpers only. Holiday categories, monitoring windows,
 * and statuses are backend-owned (see holiday-report.mapper.ts).
 */

export function formatRelativeDay(relativeDay: number) {
  if (relativeDay === 0) {
    return "Hari H";
  }

  return relativeDay < 0 ? `H${relativeDay}` : `H+${relativeDay}`;
}

export function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}
