"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type {
  HolidayListFilters,
  HolidayUpdateRequest,
  HolidayWriteRequest,
} from "../model/holiday-api.types";
import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  syncHolidays,
  updateHoliday,
} from "../service/holiday-report.service";

function invalidateHolidayData(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all });
}

export function useHolidays(filters?: HolidayListFilters, enabled = true) {
  return useQuery({
    enabled,
    placeholderData: (previousData) => previousData,
    queryFn: () => getHolidays(filters),
    queryKey: queryKeys.holidays.list(filters ?? {}),
    staleTime: 30_000,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: HolidayWriteRequest) => createHoliday(input),
    onSuccess: () => invalidateHolidayData(queryClient),
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: HolidayUpdateRequest }) =>
      updateHoliday(id, input),
    onSuccess: () => invalidateHolidayData(queryClient),
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHoliday(id),
    onSuccess: () => invalidateHolidayData(queryClient),
  });
}

export function useSyncHolidays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (year: number) => syncHolidays(year),
    onSuccess: () => invalidateHolidayData(queryClient),
  });
}
