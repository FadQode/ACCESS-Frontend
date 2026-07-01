"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/core/dashboard/model/api/auth.api";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import { queryKeys } from "@/core/dashboard/model/query-keys";

export function useCurrentUser() {
  return useQuery({
    queryFn: getCurrentUser,
    queryKey: queryKeys.auth.me,
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
    staleTime: 60_000,
  });
}
