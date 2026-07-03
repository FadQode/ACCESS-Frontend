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
    path: `/action-requests/${id}/references`,
    request,
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return proxyBackendRequest({
    method: "POST",
    path: `/action-requests/${id}/references`,
    request,
  });
}
