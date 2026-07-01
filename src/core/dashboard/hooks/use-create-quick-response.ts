"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuickResponse } from "@/core/dashboard/model/api/quick-responses.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type {
  CreateQuickResponseRequest,
  CreateQuickResponseResponse,
} from "@/core/dashboard/model/types/quick-response.types";

export function useCreateQuickResponse() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateQuickResponseResponse,
    Error,
    CreateQuickResponseRequest
  >({
    mutationFn: createQuickResponse,
    mutationKey: ["quick-responses", "create"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
    },
  });
}
