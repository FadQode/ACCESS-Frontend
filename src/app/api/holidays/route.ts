import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.search;

  return proxyBackendRequest({
    method: "GET",
    path: `/holidays${query}`,
    request,
  });
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest({
    method: "POST",
    path: "/holidays",
    request,
  });
}
