"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { takeAction } from "@/core/dashboard/model/api/action-requests.api";
import type {
  ActionRequest,
  TakeActionRequest,
} from "@/core/dashboard/model/types/action-request.types";
import { invalidateDashboardWorkflow } from "./invalidate-dashboard-workflow";

type TakeActionVariables = {
  id: string;
  input: TakeActionRequest;
};

export function useTakeAction() {
  const queryClient = useQueryClient();

  return useMutation<ActionRequest, Error, TakeActionVariables>({
    mutationFn: ({ id, input }) => takeAction(id, input),
    mutationKey: ["action-requests", "take-action"],
    onSuccess: async (_data, variables) => {
      await invalidateDashboardWorkflow(queryClient, {
        actionRequestId: variables.id,
        includeActionRequests: true,
        includeTickets: true,
      });
    },
  });
}
