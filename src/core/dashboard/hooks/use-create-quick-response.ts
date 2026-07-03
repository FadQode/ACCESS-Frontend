"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuickResponse } from "@/core/dashboard/model/api/quick-responses.api";
import type {
  CreateQuickResponseRequest,
  CreateQuickResponseResponse,
} from "@/core/dashboard/model/types/quick-response.types";
import { invalidateDashboardWorkflow } from "./invalidate-dashboard-workflow";

export function useCreateQuickResponse() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateQuickResponseResponse,
    Error,
    CreateQuickResponseRequest
  >({
    mutationFn: createQuickResponse,
    mutationKey: ["quick-responses", "create"],
    onSuccess: async (data) => {
      await invalidateDashboardWorkflow(queryClient, {
        complaintId: data.complaint.id,
        includeComplaints: true,
        includeTickets:
          Boolean(data.ticket?.id) ||
          data.quickResponseSession.outcome === "sent_hea_action",
        ticketId: data.ticket?.id,
      });
    },
  });
}
