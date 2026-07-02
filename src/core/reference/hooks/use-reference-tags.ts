"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { getReferenceTags } from "../model/api/references.api";

export function useReferenceTags() {
  return useQuery({
    queryFn: getReferenceTags,
    queryKey: queryKeys.references.tags,
    staleTime: 60_000,
  });
}
