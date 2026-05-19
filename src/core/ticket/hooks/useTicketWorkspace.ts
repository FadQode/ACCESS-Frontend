"use client";

import { useMemo, useState } from "react";
import type { ComposerMode, TicketFilter } from "../model/ticket.types";
import { mockTickets } from "../service/ticket.mock";

export function useTicketWorkspace() {
  const [selectedTicketId, setSelectedTicketId] = useState(
    mockTickets[0]?.id ?? "",
  );
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyMode, setReplyMode] = useState<ComposerMode>("reply");
  const [replyText, setReplyText] = useState("");

  const filteredTickets = useMemo(() => {
    return mockTickets.filter((ticket) => {
      const matchesFilter = filter === "all" || ticket.status === filter;
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const matchesSearch =
        normalizedQuery.length === 0 ||
        ticket.customerName.toLowerCase().includes(normalizedQuery) ||
        ticket.preview.toLowerCase().includes(normalizedQuery) ||
        ticket.id.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const selectedTicket =
    mockTickets.find((ticket) => ticket.id === selectedTicketId) ??
    mockTickets[0];

  const useSuggestedResponse = () => {
    if (!selectedTicket) {
      return;
    }

    setReplyMode("reply");
    setReplyText(selectedTicket.suggestedResponse.content);
  };

  return {
    tickets: filteredTickets,
    selectedTicket,
    selectedTicketId,
    setSelectedTicketId,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    replyMode,
    setReplyMode,
    replyText,
    setReplyText,
    useSuggestedResponse,
  };
}
