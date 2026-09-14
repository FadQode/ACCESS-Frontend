import { apiClient } from "@/core/dashboard/model/api/client";
import type {
  HolidayCalendarResponse,
  HolidayDeleteResponse,
  HolidayEntityResponse,
  HolidayListFilters,
  HolidayListResponse,
  HolidayOverviewResponse,
  HolidaySyncResponse,
  HolidayUpdateRequest,
  HolidayWriteRequest,
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

export async function getHolidays(
  filters?: HolidayListFilters,
): Promise<HolidayListResponse> {
  const params = new URLSearchParams();

  if (filters?.year !== undefined) {
    params.set("year", String(filters.year));
  }
  if (filters?.category) {
    params.set("category", filters.category);
  }
  if (filters?.source) {
    params.set("source", filters.source);
  }

  const query = params.toString();

  return apiClient.get<HolidayListResponse>(
    query ? `/holidays?${query}` : "/holidays",
  );
}

export async function createHoliday(
  input: HolidayWriteRequest,
): Promise<HolidayEntityResponse> {
  return apiClient.post<HolidayEntityResponse>("/holidays", input);
}

export async function updateHoliday(
  id: string,
  input: HolidayUpdateRequest,
): Promise<HolidayEntityResponse> {
  return apiClient.patch<HolidayEntityResponse>(`/holidays/${id}`, input);
}

export async function deleteHoliday(
  id: string,
): Promise<HolidayDeleteResponse> {
  return apiClient.delete<HolidayDeleteResponse>(`/holidays/${id}`);
}

export async function syncHolidays(year: number): Promise<HolidaySyncResponse> {
  return apiClient.post<HolidaySyncResponse>("/holidays/sync", { year });
}
