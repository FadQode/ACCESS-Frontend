"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  FollowUpTicket,
  FollowUpTicketFilter,
  FollowUpTicketStatus,
} from "../model/ticket.types";
import { mockFollowUpTickets } from "../service/ticket.mock";

const filterMap: Record<FollowUpTicketFilter, FollowUpTicketStatus[]> = {
  all: ["waiting_manager", "ready_to_notify", "closed", "escalated"],
  closed: ["closed"],
  ready: ["ready_to_notify"],
  waiting: ["waiting_manager", "escalated"],
};

export function useTicketWorkspace() {
  const [tickets, setTickets] = useState<FollowUpTicket[]>(mockFollowUpTickets);
  const [selectedTicketId, setSelectedTicketId] = useState(
    mockFollowUpTickets[0]?.id ?? "",
  );
  const [filter, setFilter] = useState<FollowUpTicketFilter>("ready");
  const [searchQuery, setSearchQuery] = useState("");
  const [closureDraft, setClosureDraft] = useState(
    mockFollowUpTickets[0]?.closureMessage ?? "",
  );
  const [closureCopiedTicketId, setClosureCopiedTicketId] = useState<
    string | null
  >(null);

  const selectedTicket = useMemo(() => {
    return (
      tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0]
    );
  }, [selectedTicketId, tickets]);

  useEffect(() => {
    const selected = tickets.find((ticket) => ticket.id === selectedTicketId);
    setClosureDraft(selected?.closureMessage ?? "");
    setClosureCopiedTicketId(null);
  }, [selectedTicketId, tickets]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesFilter = filterMap[filter].includes(ticket.status);
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [
          ticket.customerName,
          ticket.username,
          ticket.displayId,
          ticket.originalComplaint,
          ticket.category,
          ticket.managerAction.actionTaken,
          ticket.closureMessage,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, tickets]);

  const readyCount = tickets.filter(
    (ticket) => ticket.status === "ready_to_notify",
  ).length;
  const waitingCount = tickets.filter((ticket) =>
    ["waiting_manager", "escalated"].includes(ticket.status),
  ).length;
  const closedCount = tickets.filter(
    (ticket) => ticket.status === "closed",
  ).length;

  const selectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const copyClosureAndClose = async () => {
    if (!selectedTicket || closureDraft.trim().length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(closureDraft);
    } catch {
      // Clipboard can fail in non-secure contexts; the prototype still updates the workflow state.
    }

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              status: "closed",
              closureMessage: closureDraft,
              closureCopiedAt: "Baru saja",
              closedAt: "Baru saja",
              closedBy: "Rizky A.",
              activityLog: [
                {
                  id: `${ticket.id}-closure-${Date.now()}`,
                  label: "Balasan akhir disalin dan tiket ditutup",
                  actor: "Rizky A.",
                  actorType: "agent",
                  time: "Baru saja",
                  tone: "success",
                },
                ...ticket.activityLog,
              ],
            }
          : ticket,
      ),
    );
    setClosureCopiedTicketId(selectedTicket.id);
  };

  const addInternalNote = () => {
    if (!selectedTicket) {
      return;
    }

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              activityLog: [
                {
                  id: `${ticket.id}-note-${Date.now()}`,
                  label: "Catatan internal ditambahkan oleh agen",
                  actor: "Rizky A.",
                  actorType: "agent",
                  time: "Baru saja",
                  tone: "neutral",
                },
                ...ticket.activityLog,
              ],
            }
          : ticket,
      ),
    );
  };

  return {
    tickets: filteredTickets,
    allTickets: tickets,
    selectedTicket,
    selectedTicketId,
    setSelectedTicketId: selectTicket,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    closureDraft,
    setClosureDraft,
    readyCount,
    waitingCount,
    closedCount,
    hasCopiedClosure: closureCopiedTicketId === selectedTicketId,
    copyClosureAndClose,
    addInternalNote,
  };
}
