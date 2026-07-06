import axios, { type AxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

type ProxyOptions = {
  method: "DELETE" | "GET" | "PATCH" | "POST";
  request: NextRequest;
  path: string;
  timeoutMs?: number;
};

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL;
const BACKEND_TIMEOUT_MS = 15_000;

function getBackendUrl(path: string) {
  if (!BACKEND_API_BASE_URL) {
    throw new Error("BACKEND_API_BASE_URL is not configured.");
  }

  const baseUrl = BACKEND_API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

async function readProxyBody(
  request: NextRequest,
  method: ProxyOptions["method"],
) {
  if (method === "GET") {
    return undefined;
  }

  const body = await request.arrayBuffer();

  return body.byteLength > 0 ? Buffer.from(body) : undefined;
}

function createForwardHeaders(request: NextRequest, body: Buffer | undefined) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) {
    headers.Authorization = authorization;
  }

  if (body && contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}

function createProxyErrorResponse(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;

    return NextResponse.json(
      axiosError.response?.data ?? {
        success: false,
        message: "Tidak bisa terhubung ke server.",
      },
      { status: axiosError.response?.status ?? 502 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Tidak bisa terhubung ke server.",
    },
    { status: 502 },
  );
}

export async function proxyBackendRequest({
  method,
  path,
  request,
  timeoutMs = BACKEND_TIMEOUT_MS,
}: ProxyOptions) {
  try {
    const body = await readProxyBody(request, method);
    const response = await axios.request({
      data: body,
      headers: createForwardHeaders(request, body),
      method,
      responseType: "text",
      timeout: timeoutMs,
      transformResponse: [(data) => data],
      url: getBackendUrl(path),
      validateStatus: () => true,
    });

    const contentType = response.headers["content-type"];

    return new NextResponse(response.data || null, {
      headers: {
        "Content-Type":
          typeof contentType === "string" ? contentType : "application/json",
      },
      status: response.status,
    });
  } catch (error) {
    return createProxyErrorResponse(error);
  }
}
