"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { getReferenceById } from "../model/api/references.api";

export function useReferenceDetail(id: string | null) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getReferenceById(id ?? ""),
    queryKey: queryKeys.references.detail(id ?? ""),
    staleTime: 30_000,
  });
}
