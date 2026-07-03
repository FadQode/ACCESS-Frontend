"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgentPerformanceReport } from "../model/api/reports.api";
import type {
  AgentPerformanceReport,
  AgentPerformanceReportParams,
} from "../model/types/reports.types";

export function useAgentPerformanceReport(
  params: AgentPerformanceReportParams = {},
) {
  return useQuery<AgentPerformanceReport>({
    queryKey: ["reports", "agents", "performance", params],
    queryFn: () => getAgentPerformanceReport(params),
    staleTime: 60_000, // 1 minute
  });
}
