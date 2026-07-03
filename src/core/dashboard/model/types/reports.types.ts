/**
 * Reports API response types based on Phase 8 specification
 */

import type { PeriodInfo } from "./dashboard-filter.types";

// ============================================================================
// Category and Status Enums
// ============================================================================

export type ComplaintCategory =
  | "delay"
  | "refund"
  | "cancellation"
  | "lost_item"
  | "facility"
  | "payment"
  | "account"
  | "app_error"
  | "other";

export type ComplaintStatus =
  | "submitted"
  | "waiting_action"
  | "resolved"
  | "closed";

export type TicketStatus =
  | "open"
  | "hea_sent"
  | "waiting_manager_action"
  | "manager_action_done"
  | "ready_to_close"
  | "closed";

// ============================================================================
// Single Agent Report Types
// ============================================================================

export interface AgentInfo {
  id: string;
  name: string;
  email: string;
}

export interface AgentReportSummary {
  handledCount: number;
  resolvedCount: number;
  escalatedCount: number;
  openCount: number;
}

export interface AgentResolutionTrendPoint {
  bucket: string;
  handledCount: number;
  resolvedCount: number;
}

export interface ComplaintsByCategoryItem {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

export interface RecentCaseItem {
  complaintId: string;
  ticketId: string | null;
  referenceNo: string;
  complaintTextPreview: string;
  category: string;
  complaintStatus: string;
  ticketStatus: string | null;
  createdAt: string;
  lastResponseAt: string;
  resolvedAt: string | null;
}

export interface RecentCasesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RecentCases {
  items: RecentCaseItem[];
  pagination: RecentCasesPagination;
}

export interface SingleAgentReport {
  agent: AgentInfo;
  summary: AgentReportSummary;
  resolutionTrend: AgentResolutionTrendPoint[];
  complaintsByCategory: ComplaintsByCategoryItem[];
  recentCases: RecentCases;
}

// ============================================================================
// Agent Performance Report Types
// ============================================================================

export interface AgentPerformanceItem {
  agentId: string;
  agentName: string;
  agentEmail: string;
  isActive: boolean;
  handledCount: number;
  resolvedCount: number;
  escalatedCount: number;
  openCount: number;
  topCategory: string | null;
  lastActivityAt: string | null;
}

export interface AgentPerformanceReport {
  agents: AgentPerformanceItem[];
  period: PeriodInfo;
}

// ============================================================================
// API Request Params
// ============================================================================

export interface SingleAgentReportParams {
  period?: string;
  from?: string;
  to?: string;
  groupBy?: string;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  page?: number;
  limit?: number;
}

export interface AgentPerformanceReportParams {
  period?: string;
  from?: string;
  to?: string;
  groupBy?: string;
  includeInactive?: boolean;
}
