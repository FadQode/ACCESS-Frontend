export type PerformancePeriod = "7d" | "30d" | "90d";

export type ServiceSignalStatus = "strong" | "watch" | "risk";

export type CaseOutcomeType = "resolved" | "escalated";

export type SlaBand = "on-track" | "at-risk" | "overdue";

export interface AgentPerformanceSnapshot {
  agentName: string;
  dateRange: {
    from: string;
    to: string;
  };
  period: PerformancePeriod;
  periodLabel: string;
  role: string;
  slaHealth: {
    onTimePercent: number;
    activeRiskCount: number;
    overdueCount: number;
    handledWithinWindow: number;
    totalHandled: number;
  };
  metrics: {
    averageFirstResponseMinutes: number;
    resolvedToday: number;
    activeCases: number;
    qualityScore: number;
    escalationRatePercent: number;
  };
  responseTrend: ResponseTrendPoint[];
  riskByPeriod: RiskPeriodPoint[];
  qualitySignals: QualitySignal[];
  workload: WorkloadStatus[];
  urgentCasesCount: number;
  oldestActiveCaseHours: number;
  recentOutcomes: RecentServiceOutcome[];
  caseTrend: CaseTrendPoint[];
  weeklyCases: WeeklyCasePoint[];
  categoryBreakdown: CategoryBreakdownItem[];
  teamRanking: TeamRankingItem[];
}

export interface ResponseTrendPoint {
  day: string;
  minutes: number;
  targetMinutes: number;
}

export interface RiskPeriodPoint {
  label: string;
  atRisk: number;
  overdue: number;
}

export interface QualitySignal {
  label: string;
  value: string;
  percent: number;
  status: ServiceSignalStatus;
}

export interface WorkloadStatus {
  label: string;
  count: number;
  slaBand: SlaBand;
}

export interface RecentServiceOutcome {
  referenceNumber: string;
  category: string;
  outcome: CaseOutcomeType;
  slaResult: SlaBand;
  qualityScore: number;
  resolvedAt: string;
}

export interface CaseTrendPoint {
  label: string;
  resolved: number;
  averageResponseMinutes: number;
}

export interface WeeklyCasePoint {
  day: string;
  newCases: number;
  resolvedCases: number;
}

export interface CategoryBreakdownItem {
  label: string;
  percent: number;
}

export interface TeamRankingItem {
  rank: number;
  initials: string;
  name: string;
  score: number;
  isCurrentAgent: boolean;
}
