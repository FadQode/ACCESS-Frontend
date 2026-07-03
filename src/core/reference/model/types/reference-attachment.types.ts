import type {
  ReferenceCategory,
  ReferenceDisplayType,
  ReferenceSourceType,
} from "./reference.types";

export type ActionRequestReferenceUsageType =
  | "evidence"
  | "action_basis"
  | "policy_support"
  | "closure_support"
  | "related_link"
  | "internal_note";

export type QuickResponseReferenceUsageType =
  | "response_basis"
  | "template_used"
  | "policy_support"
  | "known_issue"
  | "previous_resolution"
  | "action_closure"
  | "closure_support";

export type ReferenceSelectionSource = "agent_selected" | "manager_attached";

export type AttachedActionRequestReference = {
  referenceLinkId: string;
  actionRequestId?: string;
  referenceSourceId: string;
  title: string;
  sourceType: ReferenceSourceType;
  displayType: ReferenceDisplayType;
  usageType: ActionRequestReferenceUsageType;
  note?: string | null;
  snapshotText?: string | null;
  content?: string | null;
  tags: string[];
  category?: ReferenceCategory | null;
  url?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  status?: string | null;
  attachedBy?: {
    email?: string | null;
    id: string;
    name?: string | null;
  } | null;
  createdAt?: string | null;
};

export type AttachReferenceToActionRequestInput = {
  referenceSourceId: string;
  usageType: ActionRequestReferenceUsageType;
  note?: string | null;
};

export type DetachReferenceResult = {
  deleted: boolean;
};

export type FinalClosureReferenceInput = {
  referenceSourceId: string;
  selectionSource?: ReferenceSelectionSource;
  usageType: QuickResponseReferenceUsageType;
  note?: string | null;
};
