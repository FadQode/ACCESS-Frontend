export type ReferenceSourceType =
  | "sop"
  | "faq"
  | "policy"
  | "guide"
  | "template"
  | "known_issue"
  | "external_link"
  | "uploaded_file"
  | "previous_action"
  | "internal_note";

export type ReferenceStatus = "active" | "draft" | "archived";

export type ReferenceCategory =
  | "ticket_booking"
  | "app_error"
  | "account"
  | "payment"
  | "app_update"
  | "no_response_cs"
  | "refund_cancel"
  | "queue_problem"
  | "other"
  | "lost_item"
  | "facility";

export type ReferenceDisplayType = "file" | "link" | "text";

export interface ReferenceItem {
  id: string;
  sourceType: ReferenceSourceType;
  displayType: ReferenceDisplayType;
  title: string;
  description?: string | null;
  category?: ReferenceCategory | null;
  url?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  status: ReferenceStatus;
  version: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  uploadedBy?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface ReferenceTag {
  id: string;
  name: string;
  createdAt: string;
}

export interface ReferenceListResult {
  items: ReferenceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetReferencesParams {
  query?: string;
  category?: ReferenceCategory | "";
  sourceType?: ReferenceSourceType | "";
  tag?: string;
  status?: ReferenceStatus | "";
  page?: number;
  limit?: number;
}

export interface CreateLinkReferenceInput {
  title: string;
  description?: string | null;
  url: string;
  category?: ReferenceCategory | null;
  createdByEmail?: string | null;
  createdByName?: string | null;
  tags?: string[];
}

export interface CreateTextReferenceInput {
  title: string;
  description: string;
  category?: ReferenceCategory | null;
  createdByEmail?: string | null;
  createdByName?: string | null;
  tags?: string[];
}

export interface CreateFileReferenceInput {
  title: string;
  description?: string | null;
  file: File;
  category?: ReferenceCategory | null;
  createdByEmail?: string | null;
  createdByName?: string | null;
  tags?: string[];
}

export interface UpdateReferenceInput {
  title?: string;
  description?: string | null;
  url?: string | null;
  category?: ReferenceCategory | null;
  tags?: string[];
}

export interface ReferenceFileUrl {
  signedUrl: string;
  expiresIn: number;
}
