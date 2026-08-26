"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { mapOverviewToReportModel } from "../mapper/holiday-report.mapper";
import type { HolidayReportModel } from "../model/holiday-report.types";
import { getHolidayOverview } from "../service/holiday-report.service";

export function useHolidayReport() {
  const query = useQuery({
    queryFn: async (): Promise<HolidayReportModel> => {
      const overview = await getHolidayOverview();

      return mapOverviewToReportModel(overview);
    },
    queryKey: queryKeys.holidays.overview,
    staleTime: 60_000,
  });

  const data = query.data;

  return {
    data,
    isEmpty: data ? data.holidays.length === 0 : false,
    isError: query.isError,
    isLoading: query.isPending,
    refetch: query.refetch,
  };
}
