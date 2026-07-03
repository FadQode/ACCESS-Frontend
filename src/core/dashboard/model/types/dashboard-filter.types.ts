/**
 * Shared filter types for dashboard and reports
 */

export type ReportPeriod = "7d" | "30d" | "90d" | "custom";
export type ReportGroupBy = "day" | "week" | "month";

export interface DashboardReportPeriodParams {
  period?: ReportPeriod;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  groupBy?: ReportGroupBy;
}

export interface PeriodInfo {
  from: string;
  to: string;
  groupBy: ReportGroupBy;
  timezone: string;
}
