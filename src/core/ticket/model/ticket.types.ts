export type TicketStatus = "new" | "open" | "closed";

export type TicketCategory =
  | "delay"
  | "refund"
  | "cancellation"
  | "lost-item"
  | "seat-issue"
  | "facility";

export type TicketPriority = "low" | "medium" | "high";

export type MessageSenderType = "customer" | "agent" | "system";

export type ComposerMode = "reply" | "internal-note";

export type TicketFilter = "all" | "new" | "open" | "closed";

export interface TicketPreview {
  id: string;
  customerName: string;
  preview: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  relativeTime: string;
}

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
