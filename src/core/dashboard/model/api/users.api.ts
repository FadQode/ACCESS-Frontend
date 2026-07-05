import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import type { UserRole } from "../types/auth.types";

export type UserLookupItem = {
  email?: string | null;
  id: string;
  name?: string | null;
  role?: UserRole | null;
};

const roleSchema = z
  .string()
  .transform((value): UserRole | null => {
    const normalized = value.toLowerCase();

    if (
      normalized === "agent" ||
      normalized === "manager" ||
      normalized === "admin"
    ) {
      return normalized;
    }

    return null;
  })
  .nullable()
  .optional();

const rawUserLookupSchema = z
  .object({
    email: z.string().nullable().optional(),
    id: z.union([z.string(), z.number()]).transform((value) => String(value)),
    name: z.string().nullable().optional(),
    role: roleSchema,
    username: z.string().nullable().optional(),
  })
  .passthrough()
  .transform<UserLookupItem>((value) => ({
    email: value.email ?? null,
    id: value.id,
    name: value.name ?? value.username ?? null,
    role: value.role ?? null,
  }));

const usersResponseSchema = z
  .union([
    z.array(rawUserLookupSchema),
    z.object({ items: z.array(rawUserLookupSchema).default([]) }),
    z.object({ users: z.array(rawUserLookupSchema).default([]) }),
  ])
  .transform<UserLookupItem[]>((value) => {
    if (Array.isArray(value)) {
      return value;
    }

    return "users" in value ? value.users : value.items;
  });

export async function getUsers(): Promise<UserLookupItem[]> {
  const response = await apiClient.get<unknown>("/users");

  return usersResponseSchema.parse(response);
}
