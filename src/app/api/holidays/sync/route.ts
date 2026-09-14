import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  return proxyBackendRequest({
    method: "POST",
    path: "/holidays/sync",
    request,
    timeoutMs: 45_000,
  });
}
