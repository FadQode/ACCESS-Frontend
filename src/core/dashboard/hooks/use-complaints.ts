"use client";

import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "@/core/dashboard/model/api/complaints.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type { ComplaintFilters } from "@/core/dashboard/model/types/complaint.types";

export function useComplaints(filters?: ComplaintFilters) {
  return useQuery({
    queryFn: () => getComplaints(filters),
    queryKey: queryKeys.complaints.list(filters ?? {}),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}
