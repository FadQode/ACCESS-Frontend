"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { getCalendarGridRange } from "../mapper/holiday-report.mapper";
import type { HolidayCalendarApiDay } from "../model/holiday-api.types";
import { getHolidayCalendar } from "../service/holiday-report.service";

export type HolidayDaysByDate = Map<string, HolidayCalendarApiDay>;

export function useHolidayCalendar(month: Date) {
  const range = getCalendarGridRange(month);

  return useQuery({
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<HolidayDaysByDate> => {
      const calendar = await getHolidayCalendar(range.start, range.end);

      return new Map(calendar.days.map((day) => [day.date, day]));
    },
    queryKey: queryKeys.holidays.calendar(range.start, range.end),
    staleTime: 5 * 60_000,
  });
}
