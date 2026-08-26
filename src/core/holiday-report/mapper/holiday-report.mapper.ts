import type {
  HolidayApiMonitoringWindow,
  HolidayApiRecord,
  HolidayOverviewResponse,
} from "../model/holiday-api.types";
import { parseDate } from "../model/holiday-monitoring";
import type {
  HolidayCategory,
  HolidayReportModel,
  HolidayStatus,
  LongHoliday,
  MonitoringPeriod,
  MonitoringRule,
} from "../model/holiday-report.types";

/**
 * Static presentation metadata per category. Labels/descriptions stay in the
 * frontend; every date/window/status number comes from the backend.
 * ponytail: rule-card example dates only cover current/next holiday because
 * /overview doesn't list all holidays — enrich via GET /holidays when needed.
 */
const RULE_PRESENTATION: Record<
  HolidayCategory,
  { description: string; label: string }
> = {
  imlek: {
    description: "Window ringkas untuk periode Imlek.",
    label: "Imlek",
  },
  lebaran: {
    description: "Monitoring lebih panjang untuk lonjakan trafik Lebaran.",
    label: "Lebaran",
  },
  nataru: {
    description: "Mengikuti periode Natal dan Tahun Baru.",
    label: "Nataru",
  },
  other_long_holiday: {
    description: "Untuk libur panjang lain yang ditetapkan.",
    label: "Libur Panjang Lain",
  },
  regular_holiday: {
    description: "Hari libur nasional di luar periode libur panjang.",
    label: "Hari Libur Reguler",
  },
};

const RULE_ORDER: HolidayCategory[] = [
  "lebaran",
  "nataru",
  "imlek",
  "other_long_holiday",
  "regular_holiday",
];

export function mapOverviewToReportModel(
  overview: HolidayOverviewResponse,
  fetchedAt: Date = new Date(),
): HolidayReportModel {
  const current = overview.currentHoliday
    ? mapHoliday(overview.currentHoliday)
    : undefined;
  const next = overview.next ? mapHoliday(overview.next.holiday) : undefined;

  return {
    currentPeriod: overview.monitoringPeriod
      ? mapPeriod(
          overview.monitoringPeriod,
          overview.status === "holiday" ? overview.currentHoliday : undefined,
        )
      : undefined,
    currentDate: parseDate(overview.referenceDate),
    holidays: dedupeHolidays(current, next),
    nextHoliday: next,
    nextPeriod: overview.next
      ? mapPeriod(overview.next.monitoring, overview.next.holiday)
      : undefined,
    rules: mapRules(overview),
    status: mapStatus(overview, current),
    updatedAt: fetchedAt,
  };
}

/** Monday-first visible grid range (YYYY-MM-DD) covering leading/trailing cells. */
export function getCalendarGridRange(month: Date): {
  end: string;
  start: string;
} {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const trailingDays = 6 - ((monthEnd.getDay() + 6) % 7);

  return {
    end: toDateString(addDays(monthEnd, trailingDays)),
    start: toDateString(addDays(monthStart, -leadingDays)),
  };
}

export function toDateString(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function mapHoliday(record: HolidayApiRecord): LongHoliday {
  return {
    category: record.category,
    date: record.date,
    name: record.name,
  };
}

function mapPeriod(
  window: HolidayApiMonitoringWindow,
  holiday?: HolidayApiRecord | null,
): MonitoringPeriod {
  return {
    after: window.after,
    before: window.before,
    end: parseDate(window.end),
    holidayDate: holiday?.date ? parseDate(holiday.date) : undefined,
    start: parseDate(window.start),
  };
}

function mapRules(overview: HolidayOverviewResponse): MonitoringRule[] {
  return RULE_ORDER.map((category) => ({
    after: overview.rules[category].after,
    before: overview.rules[category].before,
    category,
    description: RULE_PRESENTATION[category].description,
    label: RULE_PRESENTATION[category].label,
  }));
}

function mapStatus(
  overview: HolidayOverviewResponse,
  current?: LongHoliday,
): HolidayStatus {
  if (overview.status === "normal") {
    const known = Boolean(current ?? overview.next);

    return { kind: known ? "inactive" : "empty" };
  }

  return {
    activeHoliday: current,
    kind: "active",
    relativeDay: overview.relativeDay ?? undefined,
  };
}

function dedupeHolidays(
  current?: LongHoliday,
  next?: LongHoliday,
): LongHoliday[] {
  if (!next || current?.date === next.date) {
    return current ? [current] : [];
  }

  return current ? [current, next] : [next];
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}
