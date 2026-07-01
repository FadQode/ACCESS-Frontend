import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export async function POST(request: NextRequest) {
  return proxyBackendRequest({
    method: "POST",
    path: "/auth/login",
    request,
  });
}
