import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { clearSession, getClientSessionToken } from "@/core/auth/session";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AppApiError,
} from "@/core/dashboard/model/types/api.types";

type RequestOptions = Omit<AxiosRequestConfig, "data" | "method" | "url"> & {
  token?: string | null;
};

type RequestWithBodyOptions = RequestOptions & {
  body?: unknown;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === "true";
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiClientError extends Error implements AppApiError {
  status?: number;
  code?: string;
  details?: unknown;

  constructor({
    code,
    details,
    message,
    status,
  }: {
    code?: string;
    details?: unknown;
    message: string;
    status?: number;
  }) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function assertApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new ApiClientError({
      message: "Konfigurasi API belum tersedia.",
    });
  }

  return API_BASE_URL;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiSuccessResponse<T>(
  value: unknown,
): value is ApiSuccessResponse<T> {
  return (
    isObject(value) &&
    value.success === true &&
    typeof value.message === "string" &&
    "data" in value
  );
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    isObject(value) &&
    value.success === false &&
    typeof value.message === "string"
  );
}

function normalizeError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    if (status === 401) {
      clearSession();
    }

    if (isApiErrorResponse(responseData)) {
      return new ApiClientError({
        code: responseData.error?.code,
        details: responseData.error?.details,
        message: responseData.message,
        status,
      });
    }

    if (isObject(responseData) && typeof responseData.message === "string") {
      return new ApiClientError({
        message: responseData.message,
        status,
      });
    }

    if (axiosError.code === "ECONNABORTED") {
      return new ApiClientError({
        code: axiosError.code,
        message: "Permintaan terlalu lama. Coba lagi.",
        status,
      });
    }

    return new ApiClientError({
      code: axiosError.code,
      message: "Tidak bisa terhubung ke server.",
      status,
    });
  }

  return new ApiClientError({
    message: "Permintaan tidak berhasil.",
  });
}

function logDebug(message: string, meta: Record<string, unknown>) {
  if (!DEBUG_API) {
    return;
  }

  console.info(`[api] ${message}`, meta);
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: assertApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
  timeout: REQUEST_TIMEOUT_MS,
});

axiosClient.interceptors.request.use((config) => {
  const token =
    (config as AxiosRequestConfig & { token?: string | null }).token ??
    getClientSessionToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  logDebug("request", {
    method: config.method?.toUpperCase(),
    path: config.url,
  });

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    logDebug("response", {
      path: response.config.url,
      status: response.status,
    });

    if (isApiSuccessResponse<unknown>(response.data)) {
      return response.data.data;
    }

    return response.data;
  },
  (error) => {
    const normalizedError = normalizeError(error);

    logDebug("error", {
      message: normalizedError.message,
      status: normalizedError.status,
    });

    return Promise.reject(normalizedError);
  },
);

async function request<T>(
  method: string,
  path: string,
  options: RequestWithBodyOptions = {},
): Promise<T> {
  try {
    return await axiosClient.request<unknown, T>({
      ...options,
      data: options.body,
      method,
      url: path,
    });
  } catch (error) {
    throw normalizeError(error);
  }
}

export const apiClient = {
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>("DELETE", path, options);
  },
  get<T>(path: string, options?: RequestOptions) {
    return request<T>("GET", path, options);
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>("PATCH", path, { ...options, body });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>("POST", path, { ...options, body });
  },
};
