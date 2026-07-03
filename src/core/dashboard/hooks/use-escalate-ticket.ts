"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { escalateTicket } from "@/core/dashboard/model/api/tickets.api";
import type { Ticket } from "@/core/dashboard/model/types/ticket.types";
import { invalidateDashboardWorkflow } from "./invalidate-dashboard-workflow";

export function useEscalateTicket() {
  const queryClient = useQueryClient();

  return useMutation<Ticket, Error, string>({
    mutationFn: escalateTicket,
    mutationKey: ["tickets", "escalate"],
    onSuccess: async (_data, ticketId) => {
      await invalidateDashboardWorkflow(queryClient, {
        includeActionRequests: true,
        includeComplaints: true,
        includeTickets: true,
        ticketId,
      });
    },
  });
}
