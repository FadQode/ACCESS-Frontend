export type HolidayType = "lebaran" | "nataru" | "imlek" | "other";

export type HolidayStatusKind = "active" | "inactive" | "empty";

export interface MonitoringRule {
  after: number;
  before: number;
  description: string;
  label: string;
  type: HolidayType;
}

export interface LongHoliday {
  date: string;
  id: string;
  name: string;
  ruleType: HolidayType;
  sourceLabel: string;
}

export interface MonitoringPeriod {
  end: Date;
  holidayDate: Date;
  start: Date;
}

export interface HolidayStatus {
  activeHoliday?: LongHoliday;
  kind: HolidayStatusKind;
  relativeDay?: number;
}

export interface HolidayReportModel {
  currentDate: Date;
  holidays: LongHoliday[];
  nextHoliday?: LongHoliday;
  nextPeriod?: MonitoringPeriod;
  rules: MonitoringRule[];
  status: HolidayStatus;
  updatedAt: Date;
}
