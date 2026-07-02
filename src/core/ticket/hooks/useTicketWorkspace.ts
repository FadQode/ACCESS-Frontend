"use client";

import { useEffect, useMemo, useState } from "react";
import { useFinalClosure } from "@/core/dashboard/hooks/use-final-closure";
import { useTicketDetail } from "@/core/dashboard/hooks/use-ticket-detail";
import { useTickets } from "@/core/dashboard/hooks/use-tickets";
import { mapBackendTicketToFollowUpTicket } from "../model/ticket.mapper";
import type {
  FollowUpTicket,
  FollowUpTicketFilter,
  FollowUpTicketStatus,
} from "../model/ticket.types";

type FinalClosureFeedback = {
  open: boolean;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  description: string;
};

const filterMap: Record<FollowUpTicketFilter, FollowUpTicketStatus[]> = {
  all: ["waiting_manager", "ready_to_notify", "closed", "escalated"],
  closed: ["closed"],
  ready: ["ready_to_notify"],
  waiting: ["waiting_manager", "escalated"],
};

export function useTicketWorkspace() {
  const ticketsQuery = useTickets({ limit: 100 });
  const finalClosureMutation = useFinalClosure();
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [filter, setFilter] = useState<FollowUpTicketFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [closureDraft, setClosureDraft] = useState("");
  const [finalClosureFeedback, setFinalClosureFeedback] =
    useState<FinalClosureFeedback>({
      description: "",
      open: false,
      title: "",
      variant: "info",
    });
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
      setFinalClosureFeedback({
        description:
          "Balasan akhir wajib diisi sebelum ticket bisa ditandai selesai.",
        open: true,
        title: "Balasan akhir belum siap",
        variant: "warning",
      });
      return;
    }

    if (selectedTicket.status !== "ready_to_notify") {
      setFinalClosureFeedback({
        description:
          selectedTicket.status === "closed"
            ? "Ticket ini sudah ditutup oleh backend."
            : "Manager action belum selesai, jadi ticket belum bisa ditandai selesai.",
        open: true,
        title: "Ticket belum bisa ditutup",
        variant: "warning",
      });
      return;
    }

    const finalResponse = closureDraft.trim();

    try {
      await navigator.clipboard.writeText(finalResponse);
    } catch {
      setFinalClosureFeedback({
        description:
          "Ticket tidak ditutup. Izinkan akses clipboard atau jalankan dari konteks browser yang mendukung clipboard, lalu coba lagi.",
        open: true,
        title: "Gagal menyalin balasan akhir",
        variant: "error",
      });
      return;
    }

    try {
      await finalClosureMutation.mutateAsync({
        complaintId: selectedTicket.complaintId,
        response: {
          finalResponse,
          outcome: "sent_resolved",
          responseTarget: "public_reply",
        },
        ticketId: selectedTicket.id,
      });
      setClosureCopiedTicketId(selectedTicket.id);
      setFinalClosureFeedback({
        description:
          "Balasan akhir sudah disalin dan backend mengonfirmasi complaint resolved serta ticket closed.",
        open: true,
        title: "Ticket ditandai selesai",
        variant: "success",
      });
      await Promise.all([
        ticketsQuery.refetch(),
        selectedTicketQuery.refetch(),
      ]);
    } catch (error) {
      setFinalClosureFeedback({
        description:
          error instanceof Error
            ? `Balasan berhasil disalin, tetapi backend belum menutup ticket: ${error.message}`
            : "Balasan berhasil disalin, tetapi backend belum menutup ticket. Coba lagi.",
        open: true,
        title: "Gagal menutup ticket",
        variant: "error",
      });
    }
  };

  const dismissFinalClosureFeedback = () => {
    setFinalClosureFeedback((current) => ({
      ...current,
      open: false,
    }));
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
    isFinalClosurePending: finalClosureMutation.isPending,
    finalClosureFeedback,
    dismissFinalClosureFeedback,
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
