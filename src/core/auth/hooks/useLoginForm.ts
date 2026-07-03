"use client";

import { type FormEvent, useState } from "react";
import { z } from "zod";
import { useLogin } from "@/core/dashboard/hooks/use-login";
import type { LoginFormState } from "../model/login.types";

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export function useLoginForm() {
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((previous) => !previous);
  };

  const updateEmail = (value: string) => {
    setEmail(value);
    setErrorMessage("");
    loginMutation.resetLoginError();
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setErrorMessage("");
    loginMutation.resetLoginError();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    loginMutation.resetLoginError();

    const formState: LoginFormState = {
      email,
      password,
    };

    const validation = loginFormSchema.safeParse(formState);

    if (!validation.success) {
      setErrorMessage(
        validation.error.issues[0]?.message ?? "Lengkapi email dan password.",
      );
      return;
    }

    try {
      await loginMutation.loginAsync({
        email: validation.data.email,
        password: validation.data.password,
      });
    } catch {
      // React Query stores the normalized error for the UI to render.
    }
  };

  return {
    email,
    errorMessage: errorMessage || loginMutation.errorMessage,
    handleSubmit,
    isPasswordVisible,
    isSubmitting: loginMutation.isPending || loginMutation.isSuccess,
    password,
    setEmail: updateEmail,
    setPassword: updatePassword,
    togglePasswordVisibility,
  };
}
