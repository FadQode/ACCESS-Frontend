export type TicketStatus = "new" | "open" | "resolved" | "escalated";

export type TicketCategory =
  | "delay"
  | "refund"
  | "cancellation"
  | "lost-item"
  | "seat-issue"
  | "facility"
  | "other";

export type ResponseChannel = "email" | "whatsapp" | "phone";

export type TicketChannel = "web-form" | "quick-response" | "email" | "manual";

export type TicketFilter = TicketStatus | "all";

export interface TicketActivity {
  id: string;
  label: string;
  time: string;
  actor: string;
  tone?: "primary" | "muted" | "success" | "warning" | "danger";
}

export interface TicketSopContext {
  title: string;
  issue: string;
  disruptionKnown?: string;
  eligibility?: string;
  policyNote?: string;
}

export interface Ticket {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerInitials: string;
  contact: string;
  channel: TicketChannel;
  category: TicketCategory;
  status: TicketStatus;
  submittedAt: string;
  relativeTime: string;
  complaintText: string;
  assignedAgent: string;
  pastComplaints: string;
  responseChannel: ResponseChannel;
  responseDraft: string;
  suggestedResponse: string;
  sopContext: TicketSopContext;
  activityLog: TicketActivity[];
}

export type MessageSenderType = "customer" | "agent" | "system";

export type ComposerMode = "reply" | "internal-note";

export interface TicketMessage {
  id: string;
  senderType: MessageSenderType;
  senderName?: string;
  content: string;
  time: string;
}

export interface TicketCustomerInfo {
  name: string;
  initials: string;
  contact: string;
  channel: string;
  pastComplaints: string;
  lastContact: string;
}

export interface TicketServiceContext {
  reportedIssue: string;
  route: string;
  knownDisruption: string;
  refundPolicy: string;
}

export interface TicketSuggestedResponse {
  title: string;
  content: string;
}

export interface TicketActivityItem {
  id: string;
  label: string;
  time: string;
  actor: string;
  tone?: "danger" | "primary" | "muted";
}

export interface TicketPreview {
  id: string;
  customerName: string;
  preview: string;
  category: TicketCategory;
  status: "new" | "open" | "closed";
  priority: "low" | "medium" | "high";
  relativeTime: string;
}

export interface TicketDetailData extends TicketPreview {
  openedAt: string;
  assignedAgent: string;
  escalated: boolean;
  customer: TicketCustomerInfo;
  messages: TicketMessage[];
  serviceContext: TicketServiceContext;
  suggestedResponse: TicketSuggestedResponse;
  activityLog: TicketActivityItem[];
}

export type FollowUpTicketStatus =
  | "waiting_manager"
  | "ready_to_notify"
  | "closed"
  | "escalated";

export type FollowUpTicketCategory =
  | "delay"
  | "refund"
  | "cancellation"
  | "payment"
  | "facility"
  | "app_issue"
  | "lost_item"
  | "other";

export type ExternalChannel =
  | "twitter"
  | "instagram"
  | "facebook"
  | "google_play"
  | "app_store"
  | "other";

export type FollowUpTicketFilter = "all" | "waiting" | "ready" | "closed";

export type FollowUpTicketSortKey =
  | "status"
  | "customer"
  | "category"
  | "priority"
  | "submitted";

export type FollowUpTicketSortDirection = "asc" | "desc";

export interface FollowUpTicketSortConfig {
  key: FollowUpTicketSortKey;
  direction: FollowUpTicketSortDirection;
}

export interface TicketReference {
  id: string;
  type: "sop" | "policy" | "past_ticket" | "manager_note";
  title: string;
  summary: string;
}

export interface FollowUpTicketActivity {
  id: string;
  label: string;
  actor: string;
  actorType?:
    | "customer"
    | "agent"
    | "manager"
    | "internal"
    | "platform"
    | "system";
  time: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}

export interface ManagerActionResult {
  status: "pending" | "approved" | "rejected" | "completed";
  managerName?: string;
  completedAt?: string;
  actionTaken?: string;
  closureDraft?: string;
  references: AttachedReferenceForTicket[];
}

export type AttachedReferenceForTicket = AttachedActionRequestReference;

export type TicketClosureContext = {
  attachedReferences: AttachedReferenceForTicket[];
};

export interface FollowUpTicket {
  id: string;
  complaintId: string;
  displayId: string;
  status: FollowUpTicketStatus;
  category: FollowUpTicketCategory;
  customerName: string;
  customerInitials: string;
  username: string;
  sourceChannel: ExternalChannel;
  sourceLabel: string;
  sourceType: string;
  externalUrl?: string;
  route?: string;
  originalComplaint: string;
  submittedAt: string;
  relativeTime: string;
  safeReplyText?: string;
  safeReplyCopiedAt?: string;
  safeReplyBy?: string;
  managerAction: ManagerActionResult;
  closureMessage: string;
  closureCopiedAt?: string;
  closedAt?: string;
  closedBy?: string;
  priority: "low" | "medium" | "high" | "urgent";
  activityLog: FollowUpTicketActivity[];
}

import type { AttachedActionRequestReference } from "@/core/reference/model/types/reference-attachment.types";
