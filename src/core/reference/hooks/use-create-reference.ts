"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import {
  createFileReference,
  createLinkReference,
} from "../model/api/references.api";
import type {
  CreateFileReferenceInput,
  CreateLinkReferenceInput,
} from "../model/types/reference.types";

type CreateReferenceInput =
  | ({ mode: "file" } & CreateFileReferenceInput)
  | ({ mode: "link" } & CreateLinkReferenceInput);

export function useCreateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReferenceInput) =>
      input.mode === "file"
        ? createFileReference(input)
        : createLinkReference(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.references.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.references.tags,
      });
    },
  });
}
