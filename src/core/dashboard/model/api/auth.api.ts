import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  UserRole,
} from "@/core/dashboard/model/types/auth.types";

const roleSchema = z.string().transform((value, context): UserRole => {
  const normalizedRole = value.toLowerCase();

  if (
    normalizedRole === "agent" ||
    normalizedRole === "manager" ||
    normalizedRole === "admin"
  ) {
    return normalizedRole;
  }

  context.addIssue({
    code: "custom",
    message: "Unsupported user role.",
  });

  return z.NEVER;
});

const rawUserSchema = z
  .object({
    email: z.string().email(),
    createdAt: z.string().optional(),
    created_at: z.string().optional(),
    globalRole: roleSchema.optional(),
    id: z.union([z.string(), z.number()]).transform((value) => String(value)),
    image: z.string().nullable().optional(),
    name: z.string().optional(),
    role: roleSchema.optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .transform<AuthUser>((value, context) => {
    const role = value.role ?? value.globalRole;

    if (!role) {
      context.addIssue({
        code: "custom",
        message: "User response did not include a role.",
      });

      return z.NEVER;
    }

    return {
      createdAt: value.createdAt ?? value.created_at,
      email: value.email,
      id: value.id,
      image: value.image,
      name: value.name ?? value.email,
      role,
      updatedAt: value.updatedAt ?? value.updated_at,
    };
  });

const loginResponseSchema = z
  .object({
    accessToken: z.string().optional(),
    token: z.string().optional(),
    user: rawUserSchema,
  })
  .transform<LoginResponse>((value, context) => {
    const token = value.token ?? value.accessToken;

    if (!token) {
      context.addIssue({
        code: "custom",
        message: "Login response did not include a token.",
      });

      return z.NEVER;
    }

    return {
      token,
      user: value.user,
    };
  });

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<unknown>("/auth/login", input);

  return loginResponseSchema.parse(response);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<unknown>("/auth/me");

  return rawUserSchema.parse(response);
}
