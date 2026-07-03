import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return proxyBackendRequest({
    method: "GET",
    path: `/tickets/${id}/closure-context`,
    request,
  });
}
