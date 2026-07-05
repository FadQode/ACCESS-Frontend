"use client";

import { useQueries } from "@tanstack/react-query";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { getReferenceById } from "../model/api/references.api";

export function useReferenceDetails(referenceIds: string[], enabled = true) {
  return useQueries({
    queries: referenceIds.map((referenceId) => ({
      enabled: enabled && referenceId.length > 0,
      queryFn: () => getReferenceById(referenceId),
      queryKey: queryKeys.references.detail(referenceId),
      retry: (failureCount: number, error: Error) => {
        if (error instanceof ApiClientError && error.status === 404) {
          return false;
        }

        return failureCount < 1;
      },
      staleTime: 60_000,
    })),
  });
}
