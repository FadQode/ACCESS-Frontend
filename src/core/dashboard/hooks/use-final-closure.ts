"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComplaintQuickResponse } from "@/core/dashboard/model/api/quick-responses.api";
import type {
  FinalClosureRequest,
  FinalClosureResponse,
} from "@/core/dashboard/model/types/final-closure.types";
import { invalidateDashboardWorkflow } from "./invalidate-dashboard-workflow";

export function useFinalClosure() {
  const queryClient = useQueryClient();

  return useMutation<FinalClosureResponse, Error, FinalClosureRequest>({
    mutationFn: createComplaintQuickResponse,
    mutationKey: ["quick-responses", "final-closure"],
    onSuccess: async (_data, variables) => {
      await invalidateDashboardWorkflow(queryClient, {
        complaintId: variables.complaintId,
        includeActionRequests: true,
        includeComplaints: true,
        includeTickets: true,
        ticketId: variables.ticketId,
      });
    },
  });
}
