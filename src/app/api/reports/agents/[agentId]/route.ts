import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

type RouteContext = {
  params: Promise<{
    agentId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { agentId } = await context.params;
  const search = request.nextUrl.search;

  return proxyBackendRequest({
    method: "GET",
    path: `/reports/agents/${agentId}${search}`,
    request,
  });
}
