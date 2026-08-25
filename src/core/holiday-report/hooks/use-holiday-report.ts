"use client";

import { useMemo, useState } from "react";
import {
  HOLIDAY_REPORT_TODAY,
  mockLongHolidays,
  monitoringRules,
} from "../model/mock-long-holidays";
import { createHolidayReportModel, parseDate } from "../model/holiday-monitoring";

export function useHolidayReport() {
  const [viewState] = useState<"ready" | "loading" | "error">("ready");

  const data = useMemo(
    () =>
      createHolidayReportModel({
        currentDate: parseDate(HOLIDAY_REPORT_TODAY),
        holidays: mockLongHolidays,
        rules: monitoringRules,
        updatedAt: new Date("2026-08-22T10:15:00+07:00"),
      }),
    [],
  );

  return {
    data,
    isEmpty: data.holidays.length === 0,
    isError: viewState === "error",
    isLoading: viewState === "loading",
  };
}
