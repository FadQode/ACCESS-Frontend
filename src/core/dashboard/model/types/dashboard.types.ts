/**
 * Dashboard API response types based on Phase 8 specification
 */

import type { PeriodInfo } from "./dashboard-filter.types";

// ============================================================================
// Agent Dashboard Types
// ============================================================================

export interface AgentDashboardCards {
  openCount: number;
  resolvedCount: number;
}

export interface ResolutionSummary {
  resolvedInPeriod: number;
}

export interface ResolutionTrendPoint {
  bucket: string;
  resolvedCount: number;
}

export interface AgentDashboardSummary {
  cards: AgentDashboardCards;
  period: PeriodInfo;
  resolutionSummary: ResolutionSummary;
  resolutionTrend: ResolutionTrendPoint[];
}

// ============================================================================
// Manager Dashboard Types
// ============================================================================

export interface ManagerDashboardCards {
  totalComplaints: number;
  resolvedComplaints: number;
  escalatedComplaints: number;
}

export interface ComplaintTrendPoint {
  bucket: string;
  incoming: number;
  escalated: number;
  resolved: number;
}

export interface ComplaintCategoryBreakdown {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

export interface ManagerDashboardSummary {
  cards: ManagerDashboardCards;
  complaintTrend: ComplaintTrendPoint[];
  complaintsByCategory: ComplaintCategoryBreakdown[];
  period: PeriodInfo;
}
