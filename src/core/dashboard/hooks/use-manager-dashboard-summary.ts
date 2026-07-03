"use client";

import { useQuery } from "@tanstack/react-query";
import { getManagerDashboardSummary } from "../model/api/dashboard.api";
import type { ManagerDashboardSummary } from "../model/types/dashboard.types";
import type { DashboardReportPeriodParams } from "../model/types/dashboard-filter.types";

export function useManagerDashboardSummary(
  params: DashboardReportPeriodParams = {},
) {
  return useQuery<ManagerDashboardSummary>({
    queryKey: ["dashboard", "manager", "summary", params],
    queryFn: () => getManagerDashboardSummary(params),
    staleTime: 60_000, // 1 minute
  });
}
