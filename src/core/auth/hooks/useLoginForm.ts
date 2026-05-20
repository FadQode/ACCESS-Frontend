"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { LoginFormState } from "../model/login.types";
import { validateDummyLogin } from "../service/login.mock";

export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((previous) => !previous);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const formState: LoginFormState = {
      email,
      password,
      rememberMe,
    };

    const result = validateDummyLogin(formState);

    if (!result.account) {
      setErrorMessage(result.error ?? "Login dummy gagal.");
      return;
    }

    console.log({
      ...formState,
      role: result.account.role,
    });

    router.push(result.account.redirectPath);
  };

  return {
    email,
    errorMessage,
    handleSubmit,
    isPasswordVisible,
    password,
    rememberMe,
    setEmail,
    setPassword,
    setRememberMe,
    togglePasswordVisibility,
  };
}
