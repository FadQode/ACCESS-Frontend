import type { AttachedActionRequestReference } from "@/core/reference/model/types/reference-attachment.types";

export type ActionRequestStatus =
  | "action_planned"
  | "action_taken"
  | "closed"
  | "open"
  | "reviewing";

export type ActionRequest = {
  id: string;
  referenceNo?: string;
  managerId?: string | null;
  category: string;
  issueKey?: string | null;
  groupingKey?: string | null;
  clusterLabel: string;
  issueSummary?: string | null;
  status: ActionRequestStatus;
  actionTaken?: string | null;
  closureMessage?: string | null;
  raisedAt?: string;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  linkedComplaints?: ActionRequestLinkedComplaint[];
  references: AttachedActionRequestReference[];
};

export type ActionRequestLinkedComplaint = {
  id: string;
  actionRequestId?: string;
  complaintId?: string;
  ticketId?: string;
  agentId?: string | null;
  agentName?: string | null;
  linkedAt?: string;
  complaintText?: string;
  ticketStatus?: string;
};

export type ActionRequestFilters = {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
};

export type TakeActionRequest = {
  actionTaken: string;
  closureMessage: string;
};
