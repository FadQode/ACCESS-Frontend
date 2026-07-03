"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { detachReferenceFromActionRequest } from "../model/api/reference-attachments.api";
import type { DetachReferenceResult } from "../model/types/reference-attachment.types";

export function useDetachReferenceFromActionRequest(actionRequestId: string) {
  const queryClient = useQueryClient();

  return useMutation<DetachReferenceResult, Error, string>({
    mutationFn: (referenceLinkId) =>
      detachReferenceFromActionRequest(actionRequestId, referenceLinkId),
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
