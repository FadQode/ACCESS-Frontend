export type ClusterStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "needs_info"
  | "waiting_internal_team"
  | "action_completed"
  | "resolved"
  | "cancelled"
  | "merged";

export type ClusterPriority = "low" | "medium" | "high" | "urgent";

export type SLAStatus = "healthy" | "at_risk" | "overdue";

export type RootCauseVerificationStatus =
  | "unverified"
  | "partially_verified"
  | "verified"
  | "rejected";

export type GroupingConfidence = "low" | "medium" | "high" | "manual";

export type DecisionStatus =
  | "draft"
  | "in_progress"
  | "confirmed"
  | "completed"
  | "rejected";

export type AffectedScope = "all" | "selected" | "future_similar";

export interface ActionCluster {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  status: ClusterStatus;
  priority: ClusterPriority;
  assignedManagerId?: string;
  assignedManagerName?: string;
  complaintCount: number;
  agentCount: number;
  affectedRoute?: string;
  affectedStation?: string;
  incidentDate?: string;
  timeWindow?: string;
  possibleRootCause?: string;
  rootCauseVerificationStatus: RootCauseVerificationStatus;
  groupingConfidence: GroupingConfidence;
  decisionType?: string;
  decisionStatus?: DecisionStatus;
  affectedScope?: AffectedScope;
  internalTeam?: string;
  actionSummary?: string;
  actionResult?: string;
  referenceUrl?: string;
  managerNotes?: string;
  closureMessage?: string;
  agentInstruction?: string;
  slaStatus: SLAStatus;
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ClusterComplaint {
  id: string;
  ticketId: string;
  customerName: string;
  source:
    | "twitter"
    | "instagram"
    | "facebook"
    | "email"
    | "web_form"
    | "manual";
  complaintText: string;
  assignedAgentId: string;
  assignedAgentName: string;
  ticketStatus: string;
  sourceUrl?: string;
  createdAt: string;
}

export interface SuggestedContext {
  possibleRootCause: string;
  confidence: "low" | "medium" | "high";
  detectedPattern: string;
  affectedScope: string;
  suggestedPolicy: string;
  relevantSources: string[];
  neededVerification: string;
}

export interface ClusterAttachment {
  id: string;
  type: "file" | "url";
  label: string;
  url: string;
  uploadedByName: string;
  createdAt: string;
}

export interface ClusterAuditLog {
  id: string;
  actorName: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface ActionClusterDetail extends ActionCluster {
  complaints: ClusterComplaint[];
  suggestedContext?: SuggestedContext;
  attachments: ClusterAttachment[];
  auditLogs: ClusterAuditLog[];
}
