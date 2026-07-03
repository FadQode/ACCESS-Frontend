import type {
  ActionRequestReferenceUsageType,
  QuickResponseReferenceUsageType,
} from "../types/reference-attachment.types";

const usageTypeMap: Record<
  ActionRequestReferenceUsageType,
  QuickResponseReferenceUsageType
> = {
  action_basis: "action_closure",
  closure_support: "closure_support",
  evidence: "response_basis",
  internal_note: "closure_support",
  policy_support: "policy_support",
  related_link: "response_basis",
};

export function mapActionRequestUsageToQuickResponseUsage(
  usageType: ActionRequestReferenceUsageType,
): QuickResponseReferenceUsageType {
  return usageTypeMap[usageType];
}
