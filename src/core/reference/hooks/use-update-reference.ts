"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { updateReference } from "../model/api/references.api";
import type { UpdateReferenceInput } from "../model/types/reference.types";

export function useUpdateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReferenceInput }) =>
      updateReference(id, input),
    onSuccess: (reference) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.references.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.references.detail(reference.id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.references.tags,
      });
    },
  });
}
