import type { UserRole } from "@/core/dashboard/model/types/auth.types";

const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "session";
const ROLE_COOKIE_NAME = process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME ?? "role";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function canUseDocumentCookie() {
  return typeof document !== "undefined";
}

function getCookieValue(name: string): string | null {
  if (!canUseDocumentCookie()) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.substring(name.length + 1));
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (!canUseDocumentCookie()) {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; secure" : "";

  // biome-ignore lint/suspicious/noDocumentCookie: Phase 1 uses client-managed cookies until backend httpOnly session mode exists.
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

export function setSession(token: string, role: UserRole): void {
  writeCookie(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE_SECONDS);
  writeCookie(ROLE_COOKIE_NAME, role, SESSION_MAX_AGE_SECONDS);
}

export function clearSession(): void {
  writeCookie(SESSION_COOKIE_NAME, "", 0);
  writeCookie(ROLE_COOKIE_NAME, "", 0);
}

export function getClientSessionToken(): string | null {
  return getCookieValue(SESSION_COOKIE_NAME);
}

export function getClientRole(): UserRole | null {
  const role = getCookieValue(ROLE_COOKIE_NAME);

  if (role === "agent" || role === "manager" || role === "admin") {
    return role;
  }

  return null;
}
