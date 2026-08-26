import type { HolidayApiCategory } from "./holiday-api.types";

export type HolidayCategory = HolidayApiCategory;

export type HolidayStatusKind = "active" | "inactive" | "empty";

export interface MonitoringRule {
  after: number;
  before: number;
  category: HolidayCategory;
  description: string;
  label: string;
}

export interface LongHoliday {
  category: HolidayCategory;
  date: string;
  name: string;
}

export interface MonitoringPeriod {
  after: number;
  before: number;
  end: Date;
  holidayDate?: Date;
  start: Date;
}

export interface HolidayStatus {
  activeHoliday?: LongHoliday;
  kind: HolidayStatusKind;
  relativeDay?: number;
}

export interface HolidayReportModel {
  currentPeriod?: MonitoringPeriod;
  currentDate: Date;
  holidays: LongHoliday[];
  nextHoliday?: LongHoliday;
  nextPeriod?: MonitoringPeriod;
  rules: MonitoringRule[];
  status: HolidayStatus;
  updatedAt: Date;
}
