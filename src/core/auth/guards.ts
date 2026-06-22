import type { UserRole } from "@/core/dashboard/model/types/auth.types";

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === "agent") {
    return process.env.NEXT_PUBLIC_AGENT_DEFAULT_ROUTE ?? "/agent";
  }

  if (role === "manager") {
    return process.env.NEXT_PUBLIC_MANAGER_DEFAULT_ROUTE ?? "/manager";
  }

  return process.env.NEXT_PUBLIC_ADMIN_DEFAULT_ROUTE ?? "/manager";
}

export function isUserRole(
  value: string | null | undefined,
): value is UserRole {
  return value === "agent" || value === "manager" || value === "admin";
}
