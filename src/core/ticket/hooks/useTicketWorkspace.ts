"use client";

import { useEffect, useMemo, useState } from "react";
import { useTicketDetail } from "@/core/dashboard/hooks/use-ticket-detail";
import { useTickets } from "@/core/dashboard/hooks/use-tickets";
import { mapBackendTicketToFollowUpTicket } from "../model/ticket.mapper";
import type {
  FollowUpTicket,
  FollowUpTicketFilter,
  FollowUpTicketStatus,
} from "../model/ticket.types";

const filterMap: Record<FollowUpTicketFilter, FollowUpTicketStatus[]> = {
  all: ["waiting_manager", "ready_to_notify", "closed", "escalated"],
  closed: ["closed"],
  ready: ["ready_to_notify"],
  waiting: ["waiting_manager", "escalated"],
};

export function useTicketWorkspace() {
  const ticketsQuery = useTickets({ limit: 100 });
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [filter, setFilter] = useState<FollowUpTicketFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [closureDraft, setClosureDraft] = useState("");
  const [closureCopiedTicketId, setClosureCopiedTicketId] = useState<
    string | null
  >(null);
  const [localTicketOverrides, setLocalTicketOverrides] = useState<
    Record<string, Partial<FollowUpTicket>>
  >({});
  const selectedTicketQuery = useTicketDetail(selectedTicketId || null);

  const mappedTickets = useMemo(
    () =>
      (ticketsQuery.data?.items ?? []).map((ticket) =>
        applyTicketOverride(
          mapBackendTicketToFollowUpTicket(ticket),
          localTicketOverrides[ticket.id],
        ),
      ),
    [localTicketOverrides, ticketsQuery.data?.items],
  );

  useEffect(() => {
    if (selectedTicketId || mappedTickets.length === 0) {
      return;
    }

    setSelectedTicketId(mappedTickets[0].id);
  }, [mappedTickets, selectedTicketId]);

  useEffect(() => {
    if (
      mappedTickets.length > 0 &&
      selectedTicketId &&
      !mappedTickets.some((ticket) => ticket.id === selectedTicketId)
    ) {
      setSelectedTicketId(mappedTickets[0].id);
    }
  }, [mappedTickets, selectedTicketId]);

  const selectedTicket = useMemo(() => {
    const listTicket =
      mappedTickets.find((ticket) => ticket.id === selectedTicketId) ??
      mappedTickets[0];

    if (
      selectedTicketQuery.data &&
      selectedTicketQuery.data.id === selectedTicketId
    ) {
      return applyTicketOverride(
        mapBackendTicketToFollowUpTicket(selectedTicketQuery.data),
        localTicketOverrides[selectedTicketId],
      );
    }

    return listTicket;
  }, [
    localTicketOverrides,
    mappedTickets,
    selectedTicketId,
    selectedTicketQuery.data,
  ]);

  useEffect(() => {
    setClosureDraft(selectedTicket?.closureMessage ?? "");
  }, [selectedTicket?.closureMessage]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mappedTickets.filter((ticket) => {
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
  }, [filter, mappedTickets, searchQuery]);

  const readyCount = mappedTickets.filter(
    (ticket) => ticket.status === "ready_to_notify",
  ).length;
  const waitingCount = mappedTickets.filter((ticket) =>
    ["waiting_manager", "escalated"].includes(ticket.status),
  ).length;
  const closedCount = mappedTickets.filter(
    (ticket) => ticket.status === "closed",
  ).length;

  const selectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setClosureCopiedTicketId(null);
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

    setLocalTicketOverrides((currentOverrides) => ({
      ...currentOverrides,
      [selectedTicket.id]: {
        activityLog: [
          {
            actor: "Agen",
            actorType: "agent",
            id: `${selectedTicket.id}-closure-${Date.now()}`,
            label: "Balasan akhir disalin",
            time: "Baru saja",
            tone: "success",
          },
          ...selectedTicket.activityLog,
        ],
        closedAt: "Baru saja",
        closedBy: "Agen",
        closureCopiedAt: "Baru saja",
        closureMessage: closureDraft,
        status: "closed",
      },
    }));
    setClosureCopiedTicketId(selectedTicket.id);
  };

  const addInternalNote = () => {
    if (!selectedTicket) {
      return;
    }

    setLocalTicketOverrides((currentOverrides) => ({
      ...currentOverrides,
      [selectedTicket.id]: {
        ...currentOverrides[selectedTicket.id],
        activityLog: [
          {
            actor: "Agen",
            actorType: "agent",
            id: `${selectedTicket.id}-note-${Date.now()}`,
            label: "Catatan internal ditambahkan",
            time: "Baru saja",
            tone: "neutral",
          },
          ...selectedTicket.activityLog,
        ],
      },
    }));
  };

  return {
    tickets: filteredTickets,
    allTickets: mappedTickets,
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
    errorMessage:
      ticketsQuery.error instanceof Error
        ? ticketsQuery.error.message
        : selectedTicketQuery.error instanceof Error
          ? selectedTicketQuery.error.message
          : null,
    isLoading:
      ticketsQuery.isLoading ||
      (Boolean(selectedTicketId) && selectedTicketQuery.isLoading),
    refetchTickets: ticketsQuery.refetch,
  };
}

function applyTicketOverride(
  ticket: FollowUpTicket,
  override?: Partial<FollowUpTicket>,
) {
  if (!override) {
    return ticket;
  }

  return {
    ...ticket,
    ...override,
    activityLog: override.activityLog ?? ticket.activityLog,
    managerAction: override.managerAction ?? ticket.managerAction,
  };
}
