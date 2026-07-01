"use client";

import { useQuery } from "@tanstack/react-query";
import { getActionRequestById } from "@/core/dashboard/model/api/action-requests.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";

export function useActionRequestDetail(actionRequestId: string | null) {
  return useQuery({
    enabled: Boolean(actionRequestId),
    queryFn: () => getActionRequestById(actionRequestId ?? ""),
    queryKey: queryKeys.actionRequests.detail(actionRequestId ?? ""),
    staleTime: 30_000,
  });
}
