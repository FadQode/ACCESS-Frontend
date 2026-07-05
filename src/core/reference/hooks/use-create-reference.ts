"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import {
  createFileReference,
  createLinkReference,
  createTextReference,
} from "../model/api/references.api";
import type {
  CreateFileReferenceInput,
  CreateLinkReferenceInput,
  CreateTextReferenceInput,
} from "../model/types/reference.types";

type CreateReferenceInput =
  | ({ mode: "file" } & CreateFileReferenceInput)
  | ({ mode: "link" } & CreateLinkReferenceInput)
  | ({ mode: "text" } & CreateTextReferenceInput);

export function useCreateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReferenceInput) => {
      if (input.mode === "file") {
        return createFileReference(input);
      }

      if (input.mode === "text") {
        return createTextReference(input);
      }

      return createLinkReference(input);
    },
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
