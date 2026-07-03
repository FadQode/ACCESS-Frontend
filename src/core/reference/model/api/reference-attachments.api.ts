import { apiClient } from "@/core/dashboard/model/api/client";
import {
  actionRequestReferenceResponseSchema,
  actionRequestReferencesResponseSchema,
  detachReferenceResponseSchema,
} from "../schemas/reference-attachment.schema";
import type {
  AttachedActionRequestReference,
  AttachReferenceToActionRequestInput,
  DetachReferenceResult,
} from "../types/reference-attachment.types";

export async function getActionRequestReferences(
  actionRequestId: string,
): Promise<AttachedActionRequestReference[]> {
  const response = await apiClient.get<unknown>(
    `/action-requests/${actionRequestId}/references`,
  );

  return actionRequestReferencesResponseSchema.parse(response);
}

export async function attachReferenceToActionRequest(
  actionRequestId: string,
  input: AttachReferenceToActionRequestInput,
): Promise<AttachedActionRequestReference> {
  const response = await apiClient.post<unknown>(
    `/action-requests/${actionRequestId}/references`,
    input,
  );

  return actionRequestReferenceResponseSchema.parse(response);
}

export async function detachReferenceFromActionRequest(
  actionRequestId: string,
  referenceLinkId: string,
): Promise<DetachReferenceResult> {
  const response = await apiClient.delete<unknown>(
    `/action-requests/${actionRequestId}/references/${referenceLinkId}`,
  );

  return detachReferenceResponseSchema.parse(response);
}
