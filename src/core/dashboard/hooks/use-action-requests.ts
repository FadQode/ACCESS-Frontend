"use client";

import { useQuery } from "@tanstack/react-query";
import { getActionRequests } from "@/core/dashboard/model/api/action-requests.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type { ActionRequestFilters } from "@/core/dashboard/model/types/action-request.types";

export function useActionRequests(filters?: ActionRequestFilters) {
  return useQuery({
    queryFn: () => getActionRequests(filters),
    queryKey: queryKeys.actionRequests.list(filters ?? {}),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}
