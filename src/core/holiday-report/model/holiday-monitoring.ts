import type {
  HolidayReportModel,
  HolidayStatus,
  HolidayType,
  LongHoliday,
  MonitoringPeriod,
  MonitoringRule,
} from "./holiday-report.types";

const DAY_IN_MS = 86_400_000;

export function createHolidayReportModel({
  currentDate,
  holidays,
  rules,
  updatedAt,
}: {
  currentDate: Date;
  holidays: LongHoliday[];
  rules: MonitoringRule[];
  updatedAt: Date;
}): HolidayReportModel {
  const sortedHolidays = [...holidays].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  );
  const status = getHolidayStatus(sortedHolidays, rules, currentDate);
  const nextHoliday = getNextHoliday(sortedHolidays, rules, currentDate);
  const nextPeriod = nextHoliday
    ? getMonitoringPeriod(nextHoliday, getRuleByType(rules, nextHoliday.ruleType))
    : undefined;

  return {
    currentDate,
    holidays: sortedHolidays,
    nextHoliday,
    nextPeriod,
    rules,
    status,
    updatedAt,
  };
}

export function getHolidayStatus(
  holidays: LongHoliday[],
  rules: MonitoringRule[],
  currentDate: Date,
): HolidayStatus {
  const activeHoliday = holidays.find((holiday) => {
    const period = getMonitoringPeriod(
      holiday,
      getRuleByType(rules, holiday.ruleType),
    );

    return isDateWithinPeriod(currentDate, period);
  });

  if (!activeHoliday) {
    return {
      kind: holidays.length > 0 ? "inactive" : "empty",
    };
  }

  return {
    activeHoliday,
    kind: "active",
    relativeDay: getRelativeDay(currentDate, parseDate(activeHoliday.date)),
  };
}

export function getNextHoliday(
  holidays: LongHoliday[],
  rules: MonitoringRule[],
  currentDate: Date,
) {
  return holidays.find((holiday) => {
    const period = getMonitoringPeriod(
      holiday,
      getRuleByType(rules, holiday.ruleType),
    );

    return period.end.getTime() >= startOfDay(currentDate).getTime();
  });
}

export function getMonitoringPeriod(
  holiday: LongHoliday,
  rule: MonitoringRule,
): MonitoringPeriod {
  const holidayDate = parseDate(holiday.date);

  return {
    end: addDays(holidayDate, rule.after),
    holidayDate,
    start: addDays(holidayDate, -rule.before),
  };
}

export function getRelativeDay(currentDate: Date, holidayDate: Date) {
  return Math.round(
    (startOfDay(currentDate).getTime() - startOfDay(holidayDate).getTime()) /
      DAY_IN_MS,
  );
}

export function getRuleByType(rules: MonitoringRule[], type: HolidayType) {
  const rule = rules.find((item) => item.type === type);

  if (!rule) {
    throw new Error(`Monitoring rule not found for ${type}`);
  }

  return rule;
}

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

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return startOfDay(nextDate);
}

function isDateWithinPeriod(date: Date, period: MonitoringPeriod) {
  const timestamp = startOfDay(date).getTime();

  return timestamp >= period.start.getTime() && timestamp <= period.end.getTime();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
