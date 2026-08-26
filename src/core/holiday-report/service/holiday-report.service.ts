import { apiClient } from "@/core/dashboard/model/api/client";
import type {
  HolidayCalendarResponse,
  HolidayOverviewResponse,
} from "../model/holiday-api.types";

export async function getHolidayOverview(): Promise<HolidayOverviewResponse> {
  return apiClient.get<HolidayOverviewResponse>("/holidays/overview");
}

export async function getHolidayCalendar(
  start: string,
  end: string,
): Promise<HolidayCalendarResponse> {
  const query = new URLSearchParams({ end, start }).toString();

  return apiClient.get<HolidayCalendarResponse>(`/holidays/calendar?${query}`);
}
