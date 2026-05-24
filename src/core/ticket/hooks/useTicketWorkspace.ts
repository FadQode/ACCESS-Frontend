"use client";

import { useMemo, useState } from "react";
import type { Ticket, TicketFilter } from "../model/ticket.types";
import { mockTickets } from "../service/ticket.mock";

export function useTicketWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicketId, setSelectedTicketId] = useState(
    mockTickets[0]?.id ?? "",
  );
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [responseDraft, setResponseDraft] = useState(
    mockTickets[0]?.responseDraft ?? "",
  );
  const [sentTicketId, setSentTicketId] = useState<string | null>(null);
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  const selectedTicket = useMemo(() => {
    return (
      tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0]
    );
  }, [selectedTicketId, tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesFilter = filter === "all" || ticket.status === filter;
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const matchesSearch =
        normalizedQuery.length === 0 ||
        ticket.customerName.toLowerCase().includes(normalizedQuery) ||
        ticket.referenceNumber.toLowerCase().includes(normalizedQuery) ||
        ticket.complaintText.toLowerCase().includes(normalizedQuery) ||
        ticket.category.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, tickets]);

  const openTicketCount = tickets.filter(
    (ticket) => ticket.status !== "resolved",
  ).length;

  const updateSelectedTicket = (updater: (ticket: Ticket) => Ticket): void => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === selectedTicketId ? updater(ticket) : ticket,
      ),
    );
  };

  const selectTicket = (ticketId: string) => {
    const nextTicket =
      tickets.find((ticket) => ticket.id === ticketId) ?? tickets[0];

    setSelectedTicketId(ticketId);
    setResponseDraft(nextTicket?.responseDraft ?? "");
    setSentTicketId(null);
    setSuggestionApplied(false);
  };

  const useSuggestedResponse = () => {
    if (!selectedTicket) {
      return;
    }

    setResponseDraft(selectedTicket.suggestedResponse);
    setSuggestionApplied(true);
  };

  const sendResponse = () => {
    if (!selectedTicket || responseDraft.trim().length === 0) {
      return;
    }

    updateSelectedTicket((ticket) => ({
      ...ticket,
      responseDraft,
      status: "resolved",
      activityLog: [
        {
          id: `${ticket.id}-response-${Date.now()}`,
          label: `Response sent via ${channelLabel(ticket.responseChannel)}`,
          time: currentTimeLabel(),
          actor: ticket.assignedAgent,
          tone: "success",
        },
        ...ticket.activityLog,
      ],
    }));
    setSentTicketId(selectedTicketId);
    setSuggestionApplied(false);
  };

  const escalateTicket = () => {
    if (!selectedTicket) {
      return;
    }

    updateSelectedTicket((ticket) => ({
      ...ticket,
      status: "escalated",
      activityLog: [
        {
          id: `${ticket.id}-escalated-${Date.now()}`,
          label: "Escalated to supervisor",
          time: currentTimeLabel(),
          actor: ticket.assignedAgent,
          tone: "danger",
        },
        ...ticket.activityLog,
      ],
    }));
  };

  const resolveTicket = () => {
    if (!selectedTicket) {
      return;
    }

    updateSelectedTicket((ticket) => ({
      ...ticket,
      responseDraft,
      status: "resolved",
      activityLog: [
        {
          id: `${ticket.id}-resolved-${Date.now()}`,
          label: "Ticket resolved",
          time: currentTimeLabel(),
          actor: ticket.assignedAgent,
          tone: "success",
        },
        ...ticket.activityLog,
      ],
    }));
  };

  return {
    tickets: filteredTickets,
    openTicketCount,
    selectedTicket,
    selectedTicketId,
    setSelectedTicketId: selectTicket,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    responseDraft,
    setResponseDraft,
    hasSentResponse: sentTicketId === selectedTicketId,
    suggestionApplied,
    useSuggestedResponse,
    sendResponse,
    escalateTicket,
    resolveTicket,
  };
}

function currentTimeLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function channelLabel(channel: Ticket["responseChannel"]) {
  const labels: Record<Ticket["responseChannel"], string> = {
    email: "email",
    phone: "phone follow-up",
    whatsapp: "WhatsApp",
  };

  return labels[channel];
}
