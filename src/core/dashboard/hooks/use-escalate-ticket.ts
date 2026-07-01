"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { escalateTicket } from "@/core/dashboard/model/api/tickets.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type { Ticket } from "@/core/dashboard/model/types/ticket.types";

export function useEscalateTicket() {
  const queryClient = useQueryClient();

  return useMutation<Ticket, Error, string>({
    mutationFn: escalateTicket,
    mutationKey: ["tickets", "escalate"],
    onSuccess: (_data, ticketId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
    },
  });
}
