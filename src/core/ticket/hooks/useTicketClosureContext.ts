"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { getTicketClosureContext } from "../model/api/ticket-closure-context.api";

export function useTicketClosureContext(ticketId: string | null) {
  return useQuery({
    enabled: Boolean(ticketId),
    queryFn: () => getTicketClosureContext(ticketId ?? ""),
    queryKey: queryKeys.tickets.closureContext(ticketId ?? ""),
    retry: 1,
    staleTime: 15_000,
  });
}
