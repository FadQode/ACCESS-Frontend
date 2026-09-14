import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/core/dashboard/model/api/backend-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyBackendRequest({
    method: "GET",
    path: `/holidays/${id}`,
    request,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyBackendRequest({
    method: "PATCH",
    path: `/holidays/${id}`,
    request,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyBackendRequest({
    method: "DELETE",
    path: `/holidays/${id}`,
    request,
  });
}
