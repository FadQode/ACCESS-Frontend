"use client";

import { useQuery } from "@tanstack/react-query";
import { getSingleAgentReport } from "../model/api/reports.api";
import type {
  SingleAgentReport,
  SingleAgentReportParams,
} from "../model/types/reports.types";

export function useSingleAgentReport(
  agentId: string,
  params: SingleAgentReportParams = {},
) {
  return useQuery<SingleAgentReport>({
    queryKey: ["reports", "agents", "detail", agentId, params],
    queryFn: () => getSingleAgentReport(agentId, params),
    enabled: !!agentId,
    staleTime: 60_000, // 1 minute
  });
}
