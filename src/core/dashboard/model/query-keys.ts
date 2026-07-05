export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    users: ["auth", "users"] as const,
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
    references: (id: string) => ["action-requests", "references", id] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    closureContext: (id: string) => ["tickets", "closure-context", id] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
    list: (filters: unknown) => ["tickets", "list", filters] as const,
  },
  references: {
    all: ["references"] as const,
    detail: (id: string) => ["references", "detail", id] as const,
    fileUrl: (id: string) => ["references", "file-url", id] as const,
    list: (filters: unknown) => ["references", "list", filters] as const,
    tags: ["references", "tags"] as const,
  },
};
