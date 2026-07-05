"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import { getUsers } from "@/core/dashboard/model/api/users.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";

export function useUsers(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getUsers,
    queryKey: queryKeys.auth.users,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiClientError &&
        (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        return false;
      }

      return failureCount < 1;
    },
    staleTime: 5 * 60_000,
  });
}
