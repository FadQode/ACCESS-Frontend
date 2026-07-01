"use client";

import { useEffect, useState } from "react";
import { getClientSessionUser } from "@/core/auth/session";
import type { AuthUser } from "@/core/dashboard/model/types/auth.types";

export function useSessionUser() {
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setSessionUser(getClientSessionUser());
  }, []);

  return sessionUser;
}
