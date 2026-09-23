import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await proxyBackendRequest({
    method: "POST",
    path: "/quick-responses/full-heat",
    request: new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(body),
    }) as NextRequest,
    timeoutMs: 45_000,
  });

  if (response.status === 422) {
    const errorText = await response.clone().text();
    console.error("[Full HEAT API] 422 Error response:", errorText);
  }

  return response;
}
