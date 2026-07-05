"use client";

import { useQueries } from "@tanstack/react-query";
import { getActionRequestById } from "@/core/dashboard/model/api/action-requests.api";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import { queryKeys } from "@/core/dashboard/model/query-keys";

export function useActionRequestDetails(
  actionRequestIds: string[],
  enabled = true,
) {
  return useQueries({
    queries: actionRequestIds.map((actionRequestId) => ({
      enabled: enabled && actionRequestId.length > 0,
      queryFn: () => getActionRequestById(actionRequestId),
      queryKey: queryKeys.actionRequests.detail(actionRequestId),
      retry: (failureCount: number, error: Error) => {
        if (error instanceof ApiClientError && error.status === 404) {
          return false;
        }

        return failureCount < 1;
      },
      staleTime: 30_000,
    })),
  });
}
