/**
 * Reports API functions
 * Phase 8: Dashboard and Reports API Integration
 */

import type {
  AgentPerformanceReport,
  AgentPerformanceReportParams,
  SingleAgentReport,
  SingleAgentReportParams,
} from "../types/reports.types";
import { apiClient } from "./client";

/**
 * Get agent performance report (all agents)
 * Endpoint: GET /reports/agents/performance
 */
export async function getAgentPerformanceReport(
  params: AgentPerformanceReportParams = {},
): Promise<AgentPerformanceReport> {
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
  if (params.includeInactive !== undefined) {
    queryParams.append("includeInactive", params.includeInactive.toString());
  }

  const query = queryParams.toString();
  const path = query
    ? `/reports/agents/performance?${query}`
    : "/reports/agents/performance";

  return apiClient.get<AgentPerformanceReport>(path);
}

/**
 * Get single agent report
 * Endpoint: GET /reports/agents/{agentId}
 */
export async function getSingleAgentReport(
  agentId: string,
  params: SingleAgentReportParams = {},
): Promise<SingleAgentReport> {
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
  if (params.category) {
    queryParams.append("category", params.category);
  }
  if (params.status) {
    queryParams.append("status", params.status);
  }
  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params.limit !== undefined) {
    queryParams.append("limit", params.limit.toString());
  }

  const query = queryParams.toString();
  const path = query
    ? `/reports/agents/${agentId}?${query}`
    : `/reports/agents/${agentId}`;

  return apiClient.get<SingleAgentReport>(path);
}
