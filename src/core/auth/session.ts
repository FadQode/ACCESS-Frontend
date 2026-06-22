import type {
  AuthUser,
  UserRole,
} from "@/core/dashboard/model/types/auth.types";

const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "session";
const ROLE_COOKIE_NAME = process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME ?? "role";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_USER_STORAGE_KEY = "access.session.user";

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

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function setSession(
  token: string,
  role: UserRole,
  user?: AuthUser,
): void {
  writeCookie(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE_SECONDS);
  writeCookie(ROLE_COOKIE_NAME, role, SESSION_MAX_AGE_SECONDS);

  if (user && canUseLocalStorage()) {
    window.localStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function clearSession(): void {
  writeCookie(SESSION_COOKIE_NAME, "", 0);
  writeCookie(ROLE_COOKIE_NAME, "", 0);

  if (canUseLocalStorage()) {
    window.localStorage.removeItem(SESSION_USER_STORAGE_KEY);
  }
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

export function getClientSessionUser(): AuthUser | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(SESSION_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser) as Partial<AuthUser>;

    if (
      typeof parsedUser.id === "string" &&
      typeof parsedUser.email === "string" &&
      typeof parsedUser.name === "string" &&
      (parsedUser.role === "agent" ||
        parsedUser.role === "manager" ||
        parsedUser.role === "admin")
    ) {
      return parsedUser as AuthUser;
    }
  } catch {
    window.localStorage.removeItem(SESSION_USER_STORAGE_KEY);
  }

  return null;
}
