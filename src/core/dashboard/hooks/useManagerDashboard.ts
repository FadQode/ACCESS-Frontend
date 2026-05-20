"use client";

import { useState } from "react";
import type {
  DashboardPeriod,
  TrendInterval,
} from "../model/manager-dashboard.types";
import { managerDashboardMockData } from "../service/manager-dashboard.mock";

export function useManagerDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [trendInterval, setTrendInterval] = useState<TrendInterval>("monthly");

  return {
    dashboardData: managerDashboardMockData,
    period,
    setPeriod,
    setTrendInterval,
    trendInterval,
  };
}
