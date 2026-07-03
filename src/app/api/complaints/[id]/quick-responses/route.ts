import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return proxyBackendRequest({
    method: "POST",
    path: `/complaints/${id}/quick-responses`,
    request,
  });
}
