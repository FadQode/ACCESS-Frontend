export type ComplaintStatus =
  | "submitted"
  | "waiting_action"
  | "resolved"
  | "closed"
  | string;

export type Complaint = {
  id: string;
  referenceNo: string;
  trackingToken?: string | null;
  complaintText: string;
  source: string;
  sourceHandle?: string | null;
  sourceUrl?: string | null;
  complainerName?: string | null;
  complainerContact?: string | null;
  category: string;
  status: ComplaintStatus;
  submittedAt?: string;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ComplaintFilters = {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  source?: string;
  search?: string;
};
