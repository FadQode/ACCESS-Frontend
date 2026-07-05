import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest({
    method: "GET",
    path: `/users${request.nextUrl.search}`,
    request,
  });
}
