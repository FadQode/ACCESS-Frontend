"use client";

import { useMutation } from "@tanstack/react-query";
import { getReferenceFileUrl } from "../model/api/references.api";

export function useReferenceFileUrl() {
  return useMutation({
    mutationFn: getReferenceFileUrl,
  });
}
