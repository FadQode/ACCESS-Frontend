"use client";

import { useEffect, useMemo, useState } from "react";
import { useFinalClosure } from "@/core/dashboard/hooks/use-final-closure";
import { useTicketDetail } from "@/core/dashboard/hooks/use-ticket-detail";
import { useTickets } from "@/core/dashboard/hooks/use-tickets";
import { mapActionRequestUsageToQuickResponseUsage } from "@/core/reference/model/mappers/reference-usage.mapper";
import { mapBackendTicketToFollowUpTicket } from "../model/ticket.mapper";
import type {
  FollowUpTicket,
  FollowUpTicketFilter,
  FollowUpTicketSortConfig,
  FollowUpTicketSortKey,
  FollowUpTicketStatus,
} from "../model/ticket.types";
import { useTicketClosureContext } from "./useTicketClosureContext";

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

const ticketStatusRank: Record<FollowUpTicketStatus, number> = {
  ready_to_notify: 0,
  waiting_manager: 1,
  escalated: 2,
  closed: 3,
};

const ticketPriorityRank: Record<FollowUpTicket["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function useTicketWorkspace() {
  const ticketsQuery = useTickets({ limit: 100 });
  const finalClosureMutation = useFinalClosure();
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [filter, setFilter] = useState<FollowUpTicketFilter>("all");
  const [sortConfig, setSortConfig] = useState<FollowUpTicketSortConfig>({
    direction: "asc",
    key: "status",
  });
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
  const selectedTicketQuery = useTicketDetail(selectedTicketId || null);
  const closureContextQuery = useTicketClosureContext(selectedTicketId || null);

  const mappedTickets = useMemo(
    () =>
      (ticketsQuery.data?.items ?? []).map((ticket) =>
        mapBackendTicketToFollowUpTicket(ticket),
      ),
    [ticketsQuery.data?.items],
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

    let ticket = listTicket;

    if (
      selectedTicketQuery.data &&
      selectedTicketQuery.data.id === selectedTicketId
    ) {
      ticket = mapBackendTicketToFollowUpTicket(selectedTicketQuery.data);
    }

    if (ticket && closureContextQuery.data) {
      return {
        ...ticket,
        managerAction: {
          ...ticket.managerAction,
          references: closureContextQuery.data.attachedReferences,
        },
      };
    }

    return ticket;
  }, [
    closureContextQuery.data,
    mappedTickets,
    selectedTicketId,
    selectedTicketQuery.data,
  ]);

  useEffect(() => {
    setClosureDraft(selectedTicket?.closureMessage ?? "");
  }, [selectedTicket?.closureMessage]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = mappedTickets.filter((ticket) => {
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

    return sortFollowUpTickets(filtered, sortConfig);
  }, [filter, mappedTickets, searchQuery, sortConfig]);

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

  const changeSort = (key: FollowUpTicketSortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          direction: current.direction === "asc" ? "desc" : "asc",
          key,
        };
      }

      return {
        direction: key === "submitted" ? "desc" : "asc",
        key,
      };
    });
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
            : "Tindakan manager belum selesai, jadi ticket belum bisa ditandai selesai.",
        open: true,
        title: "Ticket belum bisa ditutup",
        variant: "warning",
      });
      return;
    }

    const finalResponse = closureDraft.trim();
    const references =
      closureContextQuery.isSuccess &&
      selectedTicket.managerAction.references.length > 0
        ? selectedTicket.managerAction.references
            .slice(0, 10)
            .map((reference) => ({
              note: reference.note ?? null,
              referenceSourceId: reference.referenceSourceId,
              selectionSource: "manager_attached" as const,
              usageType: mapActionRequestUsageToQuickResponseUsage(
                reference.usageType,
              ),
            }))
        : undefined;

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
          selectedTakeAction: selectedTicket.managerAction.actionTaken,
        },
        references,
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
        closureContextQuery.refetch(),
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

  return {
    tickets: filteredTickets,
    allTickets: mappedTickets,
    selectedTicket,
    selectedTicketId,
    setSelectedTicketId: selectTicket,
    filter,
    setFilter,
    sortConfig,
    setSortKey: changeSort,
    searchQuery,
    setSearchQuery,
    closureDraft,
    setClosureDraft,
    readyCount,
    waitingCount,
    closedCount,
    hasCopiedClosure: closureCopiedTicketId === selectedTicketId,
    isFinalClosurePending: finalClosureMutation.isPending,
    closureContextWarning:
      closureContextQuery.isError && selectedTicketId
        ? "Gagal memuat referensi terkait. Final closure tetap bisa dilanjutkan, tetapi referensi tidak akan ikut tercatat."
        : selectedTicket && selectedTicket.managerAction.references.length > 10
          ? "Maksimal 10 referensi dapat dicatat pada final closure. Hanya 10 referensi pertama yang akan ikut tercatat."
          : "",
    finalClosureFeedback,
    dismissFinalClosureFeedback,
    copyClosureAndClose,
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

function sortFollowUpTickets(
  tickets: FollowUpTicket[],
  sortConfig: FollowUpTicketSortConfig,
) {
  const direction = sortConfig.direction === "asc" ? 1 : -1;

  return [...tickets].sort((first, second) => {
    const result = compareTicketSortValues(
      getTicketSortValue(first, sortConfig.key),
      getTicketSortValue(second, sortConfig.key),
    );

    if (result !== 0) {
      return result * direction;
    }

    return (
      compareTicketSortValues(
        toTime(second.submittedAtValue ?? second.submittedAt),
        toTime(first.submittedAtValue ?? first.submittedAt),
      ) || first.displayId.localeCompare(second.displayId)
    );
  });
}

function getTicketSortValue(
  ticket: FollowUpTicket,
  key: FollowUpTicketSortKey,
): string | number {
  if (key === "status") {
    return ticketStatusRank[ticket.status];
  }

  if (key === "customer") {
    return ticket.customerName;
  }

  if (key === "category") {
    return ticket.category;
  }

  if (key === "priority") {
    return ticketPriorityRank[ticket.priority];
  }

  return toTime(ticket.submittedAtValue ?? ticket.submittedAt);
}

function compareTicketSortValues(
  first: string | number,
  second: string | number,
) {
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }

  return String(first).localeCompare(String(second), "id", {
    numeric: true,
    sensitivity: "base",
  });
}

function toTime(value?: string | null) {
  if (!value) {
    return 0;
  }

  const normalized = normalizeIndonesianDate(value);
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function normalizeIndonesianDate(value: string) {
  const monthMap: Record<string, string> = {
    Agu: "Aug",
    Agustus: "Aug",
    Apr: "Apr",
    April: "Apr",
    Des: "Dec",
    Desember: "Dec",
    Feb: "Feb",
    Februari: "Feb",
    Jan: "Jan",
    Januari: "Jan",
    Jul: "Jul",
    Juli: "Jul",
    Jun: "Jun",
    Juni: "Jun",
    Mar: "Mar",
    Maret: "Mar",
    Mei: "May",
    Nov: "Nov",
    November: "Nov",
    Okt: "Oct",
    Oktober: "Oct",
    Sep: "Sep",
    September: "Sep",
  };

  return value.replace(
    /\b(Januari|Jan|Februari|Feb|Maret|Mar|April|Apr|Mei|Juni|Jun|Juli|Jul|Agustus|Agu|September|Sep|Oktober|Okt|November|Nov|Desember|Des)\b/g,
    (month) => monthMap[month] ?? month,
  );
}
