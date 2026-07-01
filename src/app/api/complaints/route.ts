import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.search;

  return proxyBackendRequest({
    method: "GET",
    path: `/complaints${query}`,
    request,
  });
}
