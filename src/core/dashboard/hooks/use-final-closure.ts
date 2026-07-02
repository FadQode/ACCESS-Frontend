"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComplaintQuickResponse } from "@/core/dashboard/model/api/quick-responses.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type {
  FinalClosureRequest,
  FinalClosureResponse,
} from "@/core/dashboard/model/types/final-closure.types";

export function useFinalClosure() {
  const queryClient = useQueryClient();

  return useMutation<FinalClosureResponse, Error, FinalClosureRequest>({
    mutationFn: createComplaintQuickResponse,
    mutationKey: ["quick-responses", "final-closure"],
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(variables.ticketId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.complaints.detail(variables.complaintId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.actionRequests.all });
    },
  });
}
