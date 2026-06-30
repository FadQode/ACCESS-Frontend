"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { takeAction } from "@/core/dashboard/model/api/action-requests.api";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import type {
  ActionRequest,
  TakeActionRequest,
} from "@/core/dashboard/model/types/action-request.types";

type TakeActionVariables = {
  id: string;
  input: TakeActionRequest;
};

export function useTakeAction() {
  const queryClient = useQueryClient();

  return useMutation<ActionRequest, Error, TakeActionVariables>({
    mutationFn: ({ id, input }) => takeAction(id, input),
    mutationKey: ["action-requests", "take-action"],
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionRequests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.actionRequests.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}
