/**
 * ACCESS Backend response contracts for /holidays/*.
 * Source: https://access-backend-seven.vercel.app/docs#tag/holidays
 * These types describe the wire format only — never import them from UI.
 */

export type HolidayApiCategory =
  | "lebaran"
  | "nataru"
  | "imlek"
  | "other_long_holiday"
  | "regular_holiday";

export interface HolidayApiRecord {
  name: string;
  date: string;
  category: HolidayApiCategory;
}

export interface HolidayApiMonitoringWindow {
  before: number;
  after: number;
  start: string;
  end: string;
}

export type HolidayOverviewStatus = "normal" | "monitoring" | "holiday";

export interface HolidayOverviewResponse {
  status: HolidayOverviewStatus;
  referenceDate: string;
  relativeDay: number | null;
  currentHoliday: HolidayApiRecord | null;
  monitoringPeriod: HolidayApiMonitoringWindow | null;
  next: {
    holiday: HolidayApiRecord;
    monitoring: HolidayApiMonitoringWindow;
  } | null;
  rules: Record<HolidayApiCategory, { before: number; after: number }>;
}

export interface HolidayCalendarApiDay {
  date: string;
  isWeekend: boolean;
  isJointLeave: boolean;
  isBridgeDay: boolean;
  isMonitoring: boolean;
  relativeDay: number | null;
  holiday: (HolidayApiRecord & { isJointLeave: boolean }) | null;
}

export interface HolidayCalendarResponse {
  period: { start: string; end: string };
  days: HolidayCalendarApiDay[];
  longWeekends: {
    type: "long_weekend";
    start: string;
    end: string;
    duration: number;
  }[];
}
