import type { Ticket as BackendTicket } from "@/core/dashboard/model/types/ticket.types";
import type {
  ExternalChannel,
  FollowUpTicket,
  FollowUpTicketActivity,
  FollowUpTicketCategory,
  FollowUpTicketStatus,
  ManagerActionResult,
} from "./ticket.types";

export function mapBackendTicketToFollowUpTicket(
  ticket: BackendTicket,
): FollowUpTicket {
  const status = mapTicketStatus(ticket.status);
  const category = mapTicketCategory(ticket.category);
  const createdAt = ticket.createdAt ?? ticket.updatedAt;
  const agentName = ticket.agent?.name ?? "Agen";
  const managerClosureMessage = getManagerClosureMessage(ticket);
  const closureMessage = managerClosureMessage ?? ticket.closureMessage ?? "";

  return {
    activityLog: buildActivityLog(ticket, status, agentName),
    category,
    closedAt: ticket.closureSentAt
      ? formatAbsoluteDate(ticket.closureSentAt)
      : undefined,
    closedBy: ticket.closureSentAt ? agentName : undefined,
    closureCopiedAt: ticket.closureSentAt
      ? formatAbsoluteDate(ticket.closureSentAt)
      : undefined,
    closureMessage,
    complaintId: ticket.complaintId,
    customerInitials: "PA",
    customerName: "Pelanggan ACCESS",
    displayId: ticket.referenceNo ?? shortId(ticket.id),
    externalUrl: undefined,
    id: ticket.id,
    managerAction: buildManagerAction(ticket, status),
    originalComplaint: ticket.complaintText ?? "Detail keluhan belum tersedia.",
    priority: mapTicketPriority(ticket.priority),
    relativeTime: formatRelativeDate(createdAt),
    route: undefined,
    safeReplyBy: ticket.heaResponse ? agentName : undefined,
    safeReplyCopiedAt: ticket.heaSentAt
      ? formatAbsoluteDate(ticket.heaSentAt)
      : undefined,
    safeReplyText: ticket.heaResponse ?? undefined,
    sourceChannel: "other" satisfies ExternalChannel,
    sourceLabel: "Quick Response",
    sourceType: "Follow-up",
    status,
    submittedAt: formatAbsoluteDate(createdAt),
    username: ticket.referenceNo
      ? `#${ticket.referenceNo}`
      : shortId(ticket.id),
  };
}

function mapTicketStatus(status?: string): FollowUpTicketStatus {
  if (status === "closed") {
    return "closed";
  }

  if (status === "manager_action_done" || status === "ready_to_close") {
    return "ready_to_notify";
  }

  if (status === "waiting_manager_action") {
    return "waiting_manager";
  }

  return "waiting_manager";
}

function mapTicketCategory(category?: string): FollowUpTicketCategory {
  const categoryMap: Record<string, FollowUpTicketCategory> = {
    account: "app_issue",
    app: "app_issue",
    app_error: "app_issue",
    cancellation: "cancellation",
    delay: "delay",
    facility: "facility",
    lost_item: "lost_item",
    other: "other",
    payment: "payment",
    refund: "refund",
  };

  return categoryMap[category ?? ""] ?? "other";
}

function mapTicketPriority(priority?: string): FollowUpTicket["priority"] {
  if (
    priority === "low" ||
    priority === "medium" ||
    priority === "high" ||
    priority === "urgent"
  ) {
    return priority;
  }

  return "medium";
}

function buildManagerAction(
  ticket: BackendTicket,
  status: FollowUpTicketStatus,
): ManagerActionResult {
  const managerActionTaken = getManagerActionTaken(ticket);
  const managerClosureMessage = getManagerClosureMessage(ticket);

  if (status === "ready_to_notify" || status === "closed") {
    return {
      actionTaken:
        managerActionTaken ??
        "Arahan manager sudah selesai, tetapi detail arahan belum tersedia di ticket.",
      closureDraft: managerClosureMessage ?? ticket.closureMessage ?? "",
      completedAt:
        ticket.managerAction?.completedAt ??
        (ticket.updatedAt ? formatAbsoluteDate(ticket.updatedAt) : ""),
      managerName: ticket.managerAction?.managerName ?? "Manager",
      references: [],
      status: "completed",
    };
  }

  return {
    references: [],
    status: "pending",
  };
}

function getManagerActionTaken(ticket: BackendTicket) {
  return (
    ticket.actionRequest?.actionTaken ??
    ticket.managerAction?.actionTaken ??
    ticket.actionTaken ??
    null
  );
}

function getManagerClosureMessage(ticket: BackendTicket) {
  return (
    ticket.actionRequest?.closureMessage ??
    ticket.managerAction?.closureMessage ??
    null
  );
}

function buildActivityLog(
  ticket: BackendTicket,
  status: FollowUpTicketStatus,
  agentName: string,
): FollowUpTicketActivity[] {
  const items: FollowUpTicketActivity[] = [];

  if (ticket.closureSentAt) {
    items.push({
      actor: agentName,
      actorType: "agent",
      id: `${ticket.id}-closure`,
      label: "Balasan akhir tercatat",
      time: formatAbsoluteDate(ticket.closureSentAt),
      tone: "success",
    });
  }

  if (status === "ready_to_notify") {
    items.push({
      actor: "Manager",
      actorType: "manager",
      id: `${ticket.id}-manager-action`,
      label: "Arahan manager selesai",
      time: formatAbsoluteDate(ticket.updatedAt),
      tone: "success",
    });
  }

  if (status === "waiting_manager") {
    items.push({
      actor: "Sistem",
      actorType: "system",
      id: `${ticket.id}-waiting-manager`,
      label: "Menunggu arahan manager",
      time: formatAbsoluteDate(ticket.updatedAt),
      tone: "warning",
    });
  }

  if (ticket.heaSentAt) {
    items.push({
      actor: agentName,
      actorType: "agent",
      id: `${ticket.id}-hea`,
      label: "Balasan HEA disalin",
      time: formatAbsoluteDate(ticket.heaSentAt),
      tone: "neutral",
    });
  }

  items.push({
    actor: "Sistem",
    actorType: "system",
    id: `${ticket.id}-created`,
    label: "Tiket dibuat dari Quick Response",
    time: formatAbsoluteDate(ticket.createdAt),
    tone: "neutral",
  });

  return items;
}

function formatAbsoluteDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelativeDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return "Baru saja";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} menit lalu`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays} hari lalu`;
}

function shortId(id: string) {
  return `#${id.slice(0, 8)}`;
}
