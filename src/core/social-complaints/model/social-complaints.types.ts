import type { PaginationMeta } from "@/core/dashboard/model/types/api.types";

export type SocialComplaintSource = "google_play" | "facebook" | "x";

export type SocialComplaint = {
  id: string;
  source: SocialComplaintSource;
  sourceReference: string;
  content: string;
  author: string;
  sourceUrl: string | null;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
};

export type SocialComplaintFilters = {
  source?: SocialComplaintSource;
  page?: number;
  limit?: number;
};

export type PaginatedSocialComplaints = {
  items: SocialComplaint[];
  pagination: PaginationMeta;
};

export type SocialComplaintSyncResult = {
  source: SocialComplaintSource;
  fetched: number | string;
  created: number | string;
  unchanged: number | string;
  failed: number | string;
};
