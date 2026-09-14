"use client";

import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import type { DashboardRole } from "./navbar";

/**
 * Resolves the dashboard role used for chrome (sidebar/navbar).
 *
 * Admins can enter any portal, but the chrome must stay consistent: an admin
 * viewing an agent/manager page keeps the admin navigation instead of having
 * the sidebar swap to the page's native role.
 */
export function useDashboardRole(declaredRole: DashboardRole): DashboardRole {
  const sessionUser = useSessionUser();

  if (sessionUser?.role === "admin") {
    return "admin";
  }

  return declaredRole;
}
