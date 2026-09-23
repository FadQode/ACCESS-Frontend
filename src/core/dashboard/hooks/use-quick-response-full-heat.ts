"use client";

import { useMutation } from "@tanstack/react-query";
import { generateFullHeatResponse } from "@/core/dashboard/model/api/quick-responses.api";
import type {
  QuickResponseFullHeatData,
  QuickResponsePreviewRequest,
} from "@/core/dashboard/model/types/quick-response.types";

export function useQuickResponseFullHeat() {
  return useMutation<
    QuickResponseFullHeatData,
    Error,
    QuickResponsePreviewRequest
  >({
    mutationFn: generateFullHeatResponse,
    mutationKey: ["quick-responses", "full-heat"],
  });
}
