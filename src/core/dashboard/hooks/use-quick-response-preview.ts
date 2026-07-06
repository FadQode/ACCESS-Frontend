"use client";

import { useMutation } from "@tanstack/react-query";
import { previewQuickResponse } from "@/core/dashboard/model/api/quick-responses.api";
import type {
  QuickResponsePreviewData,
  QuickResponsePreviewRequest,
} from "@/core/dashboard/model/types/quick-response.types";

export function useQuickResponsePreview() {
  return useMutation<
    QuickResponsePreviewData,
    Error,
    QuickResponsePreviewRequest
  >({
    mutationFn: previewQuickResponse,
    mutationKey: ["quick-responses", "preview"],
  });
}
