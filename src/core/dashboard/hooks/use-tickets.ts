"use client";

import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/core/dashboard/model/api/tickets.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type { TicketFilters } from "@/core/dashboard/model/types/ticket.types";

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryFn: () => getTickets(filters),
    queryKey: queryKeys.tickets.list(filters ?? {}),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}
