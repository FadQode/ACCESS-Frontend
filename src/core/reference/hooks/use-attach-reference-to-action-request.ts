"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { attachReferenceToActionRequest } from "../model/api/reference-attachments.api";
import type {
  AttachedActionRequestReference,
  AttachReferenceToActionRequestInput,
} from "../model/types/reference-attachment.types";

export function useAttachReferenceToActionRequest(actionRequestId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    AttachedActionRequestReference,
    Error,
    AttachReferenceToActionRequestInput
  >({
    mutationFn: (input) =>
      attachReferenceToActionRequest(actionRequestId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.actionRequests.detail(actionRequestId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.actionRequests.references(actionRequestId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.actionRequests.all,
        }),
      ]);
    },
  });
}
