"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgentDashboardSummary } from "../model/api/dashboard.api";
import type { AgentDashboardSummary } from "../model/types/dashboard.types";
import type { DashboardReportPeriodParams } from "../model/types/dashboard-filter.types";

export function useAgentDashboardSummary(
  params: DashboardReportPeriodParams = {},
) {
  return useQuery<AgentDashboardSummary>({
    queryKey: ["dashboard", "agent", "summary", params],
    queryFn: () => getAgentDashboardSummary(params),
    staleTime: 60_000, // 1 minute
  });
}
