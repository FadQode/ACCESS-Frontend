/**
 * Dashboard API functions
 * Phase 8: Dashboard and Reports API Integration
 */

import type {
  AgentDashboardSummary,
  ManagerDashboardSummary,
} from "../types/dashboard.types";
import type { DashboardReportPeriodParams } from "../types/dashboard-filter.types";
import { apiClient } from "./client";

/**
 * Get agent dashboard summary
 * Endpoint: GET /dashboard/agent/summary
 */
export async function getAgentDashboardSummary(
  params: DashboardReportPeriodParams = {},
): Promise<AgentDashboardSummary> {
  const queryParams = new URLSearchParams();

  if (params.period) {
    queryParams.append("period", params.period);
  }
  if (params.from) {
    queryParams.append("from", params.from);
  }
  if (params.to) {
    queryParams.append("to", params.to);
  }
  if (params.groupBy) {
    queryParams.append("groupBy", params.groupBy);
  }

  const query = queryParams.toString();
  const path = query
    ? `/dashboard/agent/summary?${query}`
    : "/dashboard/agent/summary";

  return apiClient.get<AgentDashboardSummary>(path);
}

/**
 * Get manager dashboard summary
 * Endpoint: GET /dashboard/manager/summary
 */
export async function getManagerDashboardSummary(
  params: DashboardReportPeriodParams = {},
): Promise<ManagerDashboardSummary> {
  const queryParams = new URLSearchParams();

  if (params.period) {
    queryParams.append("period", params.period);
  }
  if (params.from) {
    queryParams.append("from", params.from);
  }
  if (params.to) {
    queryParams.append("to", params.to);
  }
  if (params.groupBy) {
    queryParams.append("groupBy", params.groupBy);
  }

  const query = queryParams.toString();
  const path = query
    ? `/dashboard/manager/summary?${query}`
    : "/dashboard/manager/summary";

  return apiClient.get<ManagerDashboardSummary>(path);
}
