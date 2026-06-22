"use client";

import { useQuery } from "@tanstack/react-query";
import { getComplaintById } from "@/core/dashboard/model/api/complaints.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";

export function useComplaintDetail(complaintId: string) {
  return useQuery({
    enabled: Boolean(complaintId),
    queryFn: () => getComplaintById(complaintId),
    queryKey: queryKeys.complaints.detail(complaintId),
    staleTime: 30_000,
  });
}
