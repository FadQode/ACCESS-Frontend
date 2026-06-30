"use client";

import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "@/core/dashboard/model/api/tickets.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";

export function useTicketDetail(ticketId: string | null) {
  return useQuery({
    enabled: Boolean(ticketId),
    queryFn: () => getTicketById(ticketId ?? ""),
    queryKey: queryKeys.tickets.detail(ticketId ?? ""),
    staleTime: 30_000,
  });
}
