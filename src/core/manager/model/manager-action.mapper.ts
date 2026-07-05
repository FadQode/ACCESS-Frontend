import type { ActionRequest } from "@/core/dashboard/model/types/action-request.types";
import type {
  ComplaintClusterStatus,
  ManagerActionCategory,
  ManagerActionCluster,
  ManagerActionReference,
} from "@/core/manager/model/manager-action.types";

export function mapActionRequestToManagerCluster(
  actionRequest: ActionRequest,
  agentNameById?: ReadonlyMap<string, string>,
): ManagerActionCluster {
  const linkedComplaints = actionRequest.linkedComplaints ?? [];
  const agentIds = new Set(
    linkedComplaints
      .map((complaint) => complaint.agentId ?? complaint.agentName)
      .filter((agent): agent is string => Boolean(agent)),
  );

  return {
    actionTaken: actionRequest.actionTaken ?? "",
    agentCount: agentIds.size,
    category: normalizeManagerCategory(actionRequest.category),
    closureMessage: actionRequest.closureMessage ?? "",
    completedAt: actionRequest.resolvedAt
      ? formatTime(actionRequest.resolvedAt)
      : undefined,
    completedBy:
      actionRequest.status === "action_taken" ||
      actionRequest.status === "closed"
        ? "Manager"
        : undefined,
    complaintCount: linkedComplaints.length,
    complaints: linkedComplaints.map((complaint, index) => ({
      agentName: formatAgentName(
        complaint.agentName ??
          (complaint.agentId ? agentNameById?.get(complaint.agentId) : null),
        complaint.agentId,
      ),
      complaintText: complaint.complaintText ?? "No complaint text available.",
      customerInitials: `C${index + 1}`,
      customerName: `Complaint ${shortId(complaint.complaintId ?? complaint.id)}`,
      id: complaint.id,
      linkedTicketId: complaint.ticketId ?? complaint.id,
      source: "other",
      sourceLabel: "Linked ticket",
      status: mapTicketStatusToComplaintStatus(complaint.ticketStatus),
    })),
    detectedIssue:
      actionRequest.issueSummary ??
      actionRequest.issueKey ??
      actionRequest.clusterLabel,
    displayId: actionRequest.referenceNo ?? actionRequest.id,
    id: actionRequest.id,
    policyApplies: "Review against applicable operational policy.",
    raisedAt: actionRequest.raisedAt ?? actionRequest.createdAt ?? "",
    recommendedAction: actionRequest.actionTaken ?? undefined,
    references: actionRequest.references.map(mapActionRequestReference),
    relativeTime: formatRelativeTime(
      actionRequest.raisedAt ?? actionRequest.createdAt,
    ),
    similarPastCase: actionRequest.groupingKey
      ? `Grouping key: ${actionRequest.groupingKey}`
      : undefined,
    status: mapActionRequestStatusToDisplayStatus(actionRequest.status),
    title: actionRequest.clusterLabel,
  };
}

function mapActionRequestReference(
  reference: ActionRequest["references"][number],
): ManagerActionReference {
  return {
    id: reference.referenceLinkId,
    note: reference.note,
    referenceSourceId: reference.referenceSourceId,
    summary: reference.snapshotText ?? reference.note ?? undefined,
    tags: reference.tags,
    title: reference.title,
    type: reference.displayType,
    url: reference.url,
    usageType: reference.usageType,
  };
}

function mapActionRequestStatusToDisplayStatus(
  status: ActionRequest["status"],
): ManagerActionCluster["status"] {
  if (status === "reviewing") {
    return "in_progress";
  }

  if (status === "action_taken" || status === "closed") {
    return "done";
  }

  return "pending";
}

function mapTicketStatusToComplaintStatus(
  status?: string,
): ComplaintClusterStatus {
  if (status === "closed") {
    return "closed";
  }

  if (
    status === "manager_action_done" ||
    status === "ready_to_close" ||
    status === "ready_to_notify"
  ) {
    return "ready_to_notify";
  }

  if (status === "hea_sent") {
    return "hea_sent";
  }

  return "waiting_manager";
}

function normalizeManagerCategory(category?: string): ManagerActionCategory {
  if (
    category === "delay" ||
    category === "refund" ||
    category === "cancellation" ||
    category === "facility" ||
    category === "lost_item" ||
    category === "payment" ||
    category === "app_issue" ||
    category === "other"
  ) {
    return category;
  }

  if (category === "app_error") {
    return "app_issue";
  }

  if (category === "lost-item") {
    return "lost_item";
  }

  return "other";
}

function formatAgentName(agentName?: string | null, agentId?: string | null) {
  const normalizedAgentName = agentName?.trim();

  if (normalizedAgentName) {
    return normalizedAgentName;
  }

  if (!agentId) {
    return "Unassigned agent";
  }

  return `Agent ${shortId(agentId)}`;
}

function shortId(id: string) {
  return id.slice(-4).toUpperCase();
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / 60_000);
  const hours = Math.round(absMs / 3_600_000);
  const days = Math.round(absMs / 86_400_000);
  const suffix = diffMs >= 0 ? "ago" : "from now";

  if (minutes < 60) {
    return `${Math.max(1, minutes)}m ${suffix}`;
  }

  if (hours < 24) {
    return `${hours}h ${suffix}`;
  }

  return `${days}d ${suffix}`;
}
