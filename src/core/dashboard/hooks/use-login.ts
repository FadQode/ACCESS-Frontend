"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getDefaultRouteForRole } from "@/core/auth/guards";
import { setSession } from "@/core/auth/session";
import { login } from "@/core/dashboard/model/api/auth.api";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import type {
  LoginRequest,
  LoginResponse,
} from "@/core/dashboard/model/types/auth.types";

function getFriendlyLoginError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 0) {
      return "Tidak bisa terhubung ke server. Coba lagi.";
    }

    if (error.status === 401 || error.status === 403 || error.status === 400) {
      return "Email atau password tidak valid.";
    }

    return "Login belum berhasil. Coba lagi.";
  }

  return "Login belum berhasil. Coba lagi.";
}

export function useLogin() {
  const router = useRouter();

  const mutation = useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      setSession(token, user.role);
      router.replace(getDefaultRouteForRole(user.role));
      router.refresh();
    },
  });

  return {
    errorMessage: mutation.error ? getFriendlyLoginError(mutation.error) : "",
    isError: mutation.isError,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    resetLoginError: mutation.reset,
  };
}
