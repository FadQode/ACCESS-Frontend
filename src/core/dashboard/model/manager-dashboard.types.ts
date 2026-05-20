export type DashboardPeriod = "7d" | "30d" | "90d";

export type TrendInterval = "monthly" | "weekly";

export type MetricTrend = "positive" | "negative" | "neutral";

export type ManagerMetricTone =
  | "danger"
  | "primary"
  | "purple"
  | "success"
  | "warning";

export interface ManagerMetric {
  delta: string;
  icon: "clock" | "inbox" | "shield" | "sparkles" | "timer";
  id: string;
  label: string;
  tone: ManagerMetricTone;
  trend: MetricTrend;
  value: string;
}

export interface ComplaintTrendPoint {
  escalated: number;
  incoming: number;
  label: string;
  resolved: number;
}

export interface ComplaintCategorySummary {
  id: string;
  label: string;
  percentage: number;
  tone: "muted" | "primary" | "purple" | "success" | "warning";
}

export type AgentPerformanceStatus = "needs-review" | "on-target";

export interface AgentPerformanceSummary {
  averageResponseTime: string;
  escalationCount: number;
  id: string;
  initials: string;
  name: string;
  qualityScore: number;
  resolvedCount: number;
  status: AgentPerformanceStatus;
}

export interface OpenEscalationSummary {
  assignedAgent: string;
  category: string;
  customerName: string;
  id: string;
  relativeTime: string;
  urgency: "high" | "low" | "medium";
}

export interface ManagerDashboardData {
  agentPerformance: AgentPerformanceSummary[];
  complaintCategories: ComplaintCategorySummary[];
  complaintTrend: ComplaintTrendPoint[];
  metrics: ManagerMetric[];
  openEscalations: OpenEscalationSummary[];
}
