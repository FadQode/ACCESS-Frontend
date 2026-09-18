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

export type HolidayApiSource = "skb_3_menteri" | "manual";

/**
 * The monitoring window actually in force for a holiday. When `isOverride` is
 * false the window comes from the category rule widened by the backend's
 * weekend-adjacency rule, so the UI must display it rather than recompute it.
 */
export interface HolidayApiEffectiveMonitoring {
  before: number;
  after: number;
  isOverride: boolean;
  start: string;
  end: string;
}

export interface HolidayApiEntity {
  id: string;
  name: string;
  date: string;
  category: HolidayApiCategory;
  isJointLeave: boolean;
  source: HolidayApiSource;
  sourceReference: string | null;
  /** Raw admin override, or null when the automatic window applies. */
  monitoringBefore: number | null;
  monitoringAfter: number | null;
  monitoring: HolidayApiEffectiveMonitoring;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayListResponse {
  holidays: HolidayApiEntity[];
}

export interface HolidayListFilters {
  year?: number;
  category?: HolidayApiCategory;
  source?: HolidayApiSource;
}

export interface HolidayWriteRequest {
  name: string;
  date: string;
  category: HolidayApiCategory;
  isJointLeave?: boolean;
  source?: HolidayApiSource;
  sourceReference?: string | null;
  /**
   * Admin override, in days. Both sides must be supplied together; `null` on
   * both clears the override and restores the automatic window.
   */
  monitoringBefore?: number | null;
  monitoringAfter?: number | null;
}

export type HolidayUpdateRequest = Partial<HolidayWriteRequest>;

export interface HolidayEntityResponse {
  holiday: HolidayApiEntity;
}

export interface HolidayDeleteResponse {
  deleted: boolean;
}

export interface HolidaySyncResponse {
  year: number | string;
  fetched: number | string;
  created: number | string;
  updated: number | string;
  unchanged: number | string;
  failed: number | string;
}
