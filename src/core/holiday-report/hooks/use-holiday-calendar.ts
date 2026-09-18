"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { getCalendarYearRange } from "../mapper/holiday-report.mapper";
import type { HolidayCalendarApiDay } from "../model/holiday-api.types";
import { getHolidayCalendar } from "../service/holiday-report.service";

export type HolidayDaysByDate = Map<string, HolidayCalendarApiDay>;

export type HolidayCalendarData = {
  daysByDate: HolidayDaysByDate;
  /**
   * Range the backend actually returned, so callers can distinguish a date
   * that is genuinely "normal" from one that simply has not loaded yet.
   */
  period: { end: string; start: string };
};

export function getHolidayCalendarQueryOptions(year: number) {
  const range = getCalendarYearRange(year);

  return {
    queryFn: async (): Promise<HolidayCalendarData> => {
      const calendar = await getHolidayCalendar(range.start, range.end);

      return {
        daysByDate: new Map(calendar.days.map((day) => [day.date, day])),
        period: calendar.period ?? range,
      };
    },
    queryKey: queryKeys.holidays.calendar(range.start, range.end),
    // A failing calendar request must surface as an error state, not an
    // indefinite skeleton, so do not retry a request the server rejected.
    retry: false,
    staleTime: 5 * 60_000,
  } as const;
}

/**
 * Calendar data for the whole year that `month` belongs to.
 *
 * Fetching a full year keeps month navigation a cache hit, so adjacent months
 * render complete data instead of a partially loaded grid.
 */
export function useHolidayCalendar(month: Date) {
  return useQuery(getHolidayCalendarQueryOptions(month.getFullYear()));
}

/**
 * Warm adjacent years so crossing a year boundary (e.g. December -> January)
 * is already cached by the time the user navigates there.
 */
export function usePrefetchHolidayCalendar(year: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    for (const adjacentYear of [year - 1, year + 1]) {
      void queryClient.prefetchQuery(
        getHolidayCalendarQueryOptions(adjacentYear),
      );
    }
  }, [queryClient, year]);
}
