export type TicketStatus =
  | "closed"
  | "hea_sent"
  | "manager_action_done"
  | "open"
  | "ready_to_close"
  | "waiting_manager_action";

export type TicketPriority = "high" | "low" | "medium" | "urgent";

export type Ticket = {
  id: string;
  complaintId: string;
  agentId?: string | null;
  status: TicketStatus | string;
  priority?: TicketPriority | string;
  category?: string;
  complaintStatus?: string;
  complaintText?: string;
  referenceNo?: string;
  heaResponse?: string | null;
  heaSentAt?: string | null;
  actionTaken?: string | null;
  closureMessage?: string | null;
  closureSentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  agent?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
  actionRequest?: {
    id: string;
    referenceNo?: string;
    clusterLabel?: string;
    status?: string;
    actionTaken?: string | null;
    closureMessage?: string | null;
  } | null;
  managerAction?: {
    actionTaken?: string | null;
    closureMessage?: string | null;
    completedAt?: string | null;
    managerName?: string | null;
    status?: string | null;
  } | null;
};

export type TicketFilters = {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
};
