"use client";

import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "@/core/dashboard/model/api/complaints.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type { Complaint } from "@/core/dashboard/model/types/complaint.types";

function complaintTimestamp(complaint: Complaint): number {
  const value = complaint.createdAt ?? complaint.submittedAt;

  return value ? Date.parse(value) : 0;
}

export function useLatestComplaints(limit = 5) {
  const query = useQuery({
    queryFn: async () => {
      const page = await getComplaints({ limit, page: 1 });

      return [...page.items].sort(
        (a, b) => complaintTimestamp(b) - complaintTimestamp(a),
      );
    },
    queryKey: queryKeys.complaints.latest,
    staleTime: 30_000,
  });

  const complaints = query.data;

  return {
    complaints,
    isEmpty: complaints ? complaints.length === 0 : false,
    isError: query.isError,
    isLoading: query.isPending,
    refetch: query.refetch,
  };
}
