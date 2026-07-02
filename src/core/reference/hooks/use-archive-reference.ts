"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import { archiveReference } from "../model/api/references.api";

export function useArchiveReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveReference,
    onSuccess: (reference) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.references.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.references.detail(reference.id),
      });
    },
  });
}
