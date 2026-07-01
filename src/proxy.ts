import { type NextRequest, NextResponse } from "next/server";
import { getDefaultRouteForRole, isUserRole } from "@/core/auth/guards";

const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "session";
const ROLE_COOKIE_NAME = process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME ?? "role";

function redirectTo(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url));
}

function redirectToLoginAndClearSession(request: NextRequest) {
  const response = redirectTo("/login", request);

  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(ROLE_COOKIE_NAME);

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const roleValue = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const role = isUserRole(roleValue) ? roleValue : null;
  const isAuthRoute = pathname === "/login";
  const isAgentRoute = pathname.startsWith("/agent");
  const isManagerRoute = pathname.startsWith("/manager");
  const isProtectedRoute = isAgentRoute || isManagerRoute;

  if (isAuthRoute && session && role) {
    return redirectTo(getDefaultRouteForRole(role), request);
  }

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!session) {
    return redirectTo("/login", request);
  }

  if (!role) {
    return redirectToLoginAndClearSession(request);
  }

  if (isManagerRoute && role === "agent") {
    return redirectTo(getDefaultRouteForRole(role), request);
  }

  if (isAgentRoute && (role === "manager" || role === "admin")) {
    return redirectTo(getDefaultRouteForRole(role), request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/agent/:path*", "/manager/:path*"],
};
