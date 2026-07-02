import type {
  CreateQuickResponseRequest,
  QuickResponseCategory,
  QuickResponseOutcome,
  QuickResponseSource,
  QuickResponseTarget,
} from "@/core/dashboard/model/types/quick-response.types";

export type QuickResponseUiSource =
  | "twitter"
  | "instagram"
  | "facebook"
  | "google-play"
  | "app-store"
  | "other";

export type QuickResponseUiTarget =
  | "public-reply"
  | "direct-message"
  | "app-review"
  | "internal-note";

export type QuickResponseUiOutcome = "resolved" | "ticket";
export type QuickResponseUiCategory = "delay" | "refund" | "app" | "generic";

export type QuickResponseMapperInput = {
  category: QuickResponseUiCategory | string;
  complaintText: string;
  finalResponse: string;
  outcome: QuickResponseUiOutcome;
  responseTarget: QuickResponseUiTarget;
  safeReply: string;
  selectedApologize?: string | null;
  selectedEmpathize?: string | null;
  selectedHear?: string | null;
  selectedTakeAction?: string | null;
  source: QuickResponseUiSource | string;
  sourceHandle?: string | null;
  sourceUrl?: string | null;
  tone?: string | null;
};

export const sourceToBackendMap: Record<string, QuickResponseSource> = {
  "app-store": "app_store",
  facebook: "facebook",
  "google-play": "google_play",
  instagram: "instagram",
  other: "other",
  twitter: "twitter",
  web_form: "web_form",
};

export const categoryToBackendMap: Record<string, QuickResponseCategory> = {
  account: "account",
  app: "app_error",
  app_error: "app_error",
  cancellation: "cancellation",
  delay: "delay",
  facility: "facility",
  generic: "other",
  lost_item: "lost_item",
  other: "other",
  payment: "payment",
  refund: "refund",
};

export const targetToBackendMap: Record<string, QuickResponseTarget> = {
  "app-review": "app_review",
  "direct-message": "dm",
  "internal-note": "internal_note",
  "public-reply": "public_reply",
};

export const outcomeToBackendMap: Record<
  QuickResponseUiOutcome,
  QuickResponseOutcome
> = {
  resolved: "sent_resolved",
  ticket: "sent_hea_action",
};

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function mapQuickResponseToCreateRequest(
  input: QuickResponseMapperInput,
): CreateQuickResponseRequest {
  const backendOutcome = outcomeToBackendMap[input.outcome];
  const backendSource = sourceToBackendMap[input.source] ?? "other";
  const backendCategory = categoryToBackendMap[input.category] ?? "other";
  const backendTarget =
    targetToBackendMap[input.responseTarget] ?? "public_reply";
  const responseText =
    backendOutcome === "sent_hea_action"
      ? input.safeReply
      : input.finalResponse;

  return {
    complaint: {
      category: backendCategory,
      complaintText: input.complaintText.trim(),
      complainerContact: null,
      complainerName: null,
      source: backendSource,
      sourceHandle: emptyToNull(input.sourceHandle),
      sourceUrl: emptyToNull(input.sourceUrl),
    },
    response: {
      finalResponse: responseText.trim(),
      outcome: backendOutcome,
      responseTarget: backendTarget,
      responseTone: emptyToNull(input.tone),
      selectedApologize: emptyToNull(input.selectedApologize),
      selectedEmpathize: emptyToNull(input.selectedEmpathize),
      selectedHear: emptyToNull(input.selectedHear),
      selectedTakeAction: emptyToNull(input.selectedTakeAction),
    },
  };
}
