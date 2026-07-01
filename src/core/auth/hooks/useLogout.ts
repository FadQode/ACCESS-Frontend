"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clearSession } from "@/core/auth/session";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    clearSession();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };
}
