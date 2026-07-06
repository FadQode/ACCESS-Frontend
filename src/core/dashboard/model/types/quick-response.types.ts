export type QuickResponseOutcome =
  | "copy_only"
  | "sent_resolved"
  | "sent_hea_action";

export type QuickResponseTarget =
  | "public_reply"
  | "dm"
  | "app_review"
  | "internal_note";

export type QuickResponseSource =
  | "web_form"
  | "twitter"
  | "instagram"
  | "facebook"
  | "google_play"
  | "app_store"
  | "other";

export type QuickResponseCategory =
  | "delay"
  | "refund"
  | "cancellation"
  | "lost_item"
  | "facility"
  | "payment"
  | "account"
  | "app_error"
  | "other";

export type CreateQuickResponseRequest = {
  complaint: {
    complaintText: string;
    source?: QuickResponseSource;
    sourceHandle?: string | null;
    sourceUrl?: string | null;
    complainerName?: string | null;
    complainerContact?: string | null;
    category: QuickResponseCategory;
  };
  response: {
    responseTarget: QuickResponseTarget;
    responseTone?: string | null;
    selectedHear?: string | null;
    selectedEmpathize?: string | null;
    selectedApologize?: string | null;
    selectedTakeAction?: string | null;
    finalResponse?: string | null;
    outcome: QuickResponseOutcome;
  };
};

export type QuickResponsePreviewRequest = {
  complaintText: string;
  category?: QuickResponseCategory;
  responseTone?: string | null;
  responseTarget?: QuickResponseTarget;
};

export type QuickResponseSuggestionSource = "ai" | "fallback";

export type QuickResponsePreviewSuggestions = {
  hear: string[];
  empathize: string[];
  apologize: string[];
  takeAction: string[];
};

export type QuickResponsePreviewData = {
  suggestionSource: QuickResponseSuggestionSource;
  suggestions: QuickResponsePreviewSuggestions;
};

export type QuickResponsePreviewResponse = {
  success: true;
  message: string;
  data: QuickResponsePreviewData;
};

export type SelectedHeat = {
  selectedHear: string;
  selectedEmpathize: string;
  selectedApologize: string;
  selectedTakeAction: string;
};

export type QuickResponseSession = {
  id: string;
  outcome: QuickResponseOutcome;
  finalResponse?: string | null;
  createdAt?: string;
};

export type QuickResponseCreatedComplaint = {
  id: string;
  referenceNo?: string;
  status?: string;
  category?: QuickResponseCategory | string;
  complaintText?: string;
  submittedAt?: string;
  resolvedAt?: string | null;
};

export type QuickResponseCreatedTicket = {
  id: string;
  status?: string;
  priority?: string;
};

export type CreateQuickResponseResponse = {
  complaint: QuickResponseCreatedComplaint;
  quickResponseSession: QuickResponseSession;
  ticket?: QuickResponseCreatedTicket | null;
  requiresFollowUp?: boolean;
};
