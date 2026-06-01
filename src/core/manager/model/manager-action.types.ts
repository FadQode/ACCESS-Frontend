export type ManagerActionStatus = "pending" | "in_progress" | "done";

export type ManagerActionCategory =
  | "delay"
  | "refund"
  | "cancellation"
  | "facility"
  | "lost_item"
  | "payment"
  | "app_issue"
  | "other";

export type ComplaintClusterStatus =
  | "hea_sent"
  | "waiting_manager"
  | "ready_to_notify"
  | "closed";

export type ComplaintSource =
  | "twitter"
  | "instagram"
  | "facebook"
  | "web_form"
  | "google_play"
  | "app_store"
  | "other";

export type ReferenceType = "sop" | "policy" | "past_ticket" | "document" | "url";

export interface ManagerClusterComplaint {
  id: string;
  linkedTicketId: string;
  customerName: string;
  customerInitials: string;
  source: ComplaintSource;
  sourceLabel: string;
  agentName: string;
  complaintText: string;
  status: ComplaintClusterStatus;
}

export interface ManagerActionReference {
  id: string;
  type: ReferenceType;
  title: string;
  summary?: string;
}

export interface ManagerActionCluster {
  id: string;
  displayId: string;
  title: string;
  category: ManagerActionCategory;
  status: ManagerActionStatus;

  complaintCount: number;
  agentCount: number;
  raisedAt: string;
  relativeTime: string;

  affectedRoute?: string;
  detectedIssue: string;
  policyApplies: string;
  similarPastCase?: string;
  recommendedAction?: string;

  complaints: ManagerClusterComplaint[];
  references: ManagerActionReference[];

  actionTaken: string;
  closureMessage: string;

  assignedManager?: string;
  completedBy?: string;
  completedAt?: string;
}
