import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

type RouteContext = {
  params: Promise<{
    id: string;
    referenceLinkId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id, referenceLinkId } = await context.params;

  return proxyBackendRequest({
    method: "DELETE",
    path: `/action-requests/${id}/references/${referenceLinkId}`,
    request,
  });
}
