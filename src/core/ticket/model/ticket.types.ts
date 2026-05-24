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
