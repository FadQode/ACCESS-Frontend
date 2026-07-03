import type { FinalClosureReferenceInput } from "@/core/reference/model/types/reference-attachment.types";
import type {
  QuickResponseOutcome,
  QuickResponseTarget,
} from "./quick-response.types";

export type FinalClosureRequest = {
  ticketId: string;
  complaintId: string;
  response: {
    responseTarget: QuickResponseTarget;
    responseTone?: string | null;
    selectedHear?: string | null;
    selectedEmpathize?: string | null;
    selectedApologize?: string | null;
    selectedTakeAction?: string | null;
    finalResponse: string;
    outcome: Extract<QuickResponseOutcome, "sent_resolved">;
  };
  references?: FinalClosureReferenceInput[];
};

export type FinalClosureResponse = {
  complaint: {
    id: string;
    status?: string;
    resolvedAt?: string | null;
  };
  ticket?: {
    id: string;
    status?: string;
  } | null;
  quickResponseSession: {
    id: string;
    outcome: Extract<QuickResponseOutcome, "sent_resolved">;
    finalResponse: string | null;
    createdAt?: string;
  };
};
