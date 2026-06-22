export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  complaints: {
    all: ["complaints"] as const,
    detail: (id: string) => ["complaints", "detail", id] as const,
    list: (filters: unknown) => ["complaints", "list", filters] as const,
  },
};
