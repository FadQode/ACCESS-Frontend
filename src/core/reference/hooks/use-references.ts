"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { getReferences } from "../model/api/references.api";
import type { GetReferencesParams } from "../model/types/reference.types";

export function useReferences(filters?: GetReferencesParams) {
  return useQuery({
    queryFn: () => getReferences(filters),
    queryKey: queryKeys.references.list(filters ?? {}),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}
