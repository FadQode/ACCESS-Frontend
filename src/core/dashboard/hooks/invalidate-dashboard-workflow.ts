"use client";

import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";

type WorkflowInvalidationInput = {
  actionRequestId?: string;
  complaintId?: string;
  includeActionRequests?: boolean;
  includeComplaints?: boolean;
  includeTickets?: boolean;
  ticketId?: string;
};

export async function invalidateDashboardWorkflow(
  queryClient: QueryClient,
  {
    actionRequestId,
    complaintId,
    includeActionRequests = false,
    includeComplaints = false,
    includeTickets = false,
    ticketId,
  }: WorkflowInvalidationInput,
) {
  const invalidations: Array<Promise<unknown>> = [];

  if (includeComplaints || complaintId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.complaints.all,
        refetchType: "all",
      }),
    );
  }

  if (complaintId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.complaints.detail(complaintId),
        refetchType: "all",
      }),
    );
  }

  if (includeTickets || ticketId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.all,
        refetchType: "all",
      }),
    );
  }

  if (ticketId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
        refetchType: "all",
      }),
    );
  }

  if (includeActionRequests || actionRequestId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.actionRequests.all,
        refetchType: "all",
      }),
    );
  }

  if (actionRequestId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.actionRequests.detail(actionRequestId),
        refetchType: "all",
      }),
    );
  }

  await Promise.all(invalidations);
}
