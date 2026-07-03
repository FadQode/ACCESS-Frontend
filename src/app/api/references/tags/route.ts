import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest({
    method: "GET",
    path: "/references/tags",
    request,
  });
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest({
    method: "POST",
    path: "/references/tags",
    request,
  });
}
