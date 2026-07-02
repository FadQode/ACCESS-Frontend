"use client";

import { useMemo } from "react";
import { useComplaints } from "@/core/dashboard/hooks/use-complaints";

const countFilter = {
  limit: 1,
  page: 1,
};

export function useComplaintStatusCounts() {
  const allQuery = useComplaints(countFilter);
  const submittedQuery = useComplaints({
    ...countFilter,
    status: "submitted",
  });
  const waitingActionQuery = useComplaints({
    ...countFilter,
    status: "waiting_action",
  });
  const resolvedQuery = useComplaints({
    ...countFilter,
    status: "resolved",
  });
  const closedQuery = useComplaints({
    ...countFilter,
    status: "closed",
  });

  const counts = useMemo(
    () => ({
      all: allQuery.data?.pagination.total ?? 0,
      closed: closedQuery.data?.pagination.total ?? 0,
      resolved: resolvedQuery.data?.pagination.total ?? 0,
      submitted: submittedQuery.data?.pagination.total ?? 0,
      waiting_action: waitingActionQuery.data?.pagination.total ?? 0,
    }),
    [
      allQuery.data?.pagination.total,
      closedQuery.data?.pagination.total,
      resolvedQuery.data?.pagination.total,
      submittedQuery.data?.pagination.total,
      waitingActionQuery.data?.pagination.total,
    ],
  );

  return {
    counts,
    isLoading:
      allQuery.isLoading ||
      submittedQuery.isLoading ||
      waitingActionQuery.isLoading ||
      resolvedQuery.isLoading ||
      closedQuery.isLoading,
  };
}
