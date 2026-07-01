export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  complaints: {
    all: ["complaints"] as const,
    detail: (id: string) => ["complaints", "detail", id] as const,
    list: (filters: unknown) => ["complaints", "list", filters] as const,
  },
  actionRequests: {
    all: ["action-requests"] as const,
    detail: (id: string) => ["action-requests", "detail", id] as const,
    list: (filters: unknown) => ["action-requests", "list", filters] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
    list: (filters: unknown) => ["tickets", "list", filters] as const,
  },
};
