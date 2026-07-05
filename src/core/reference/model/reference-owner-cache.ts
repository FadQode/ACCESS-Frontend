import type { ReferenceOwnerFallback } from "./mappers/reference.mapper";

const REFERENCE_OWNER_CACHE_KEY = "rail-support:reference-owners";

export type ReferenceOwnerCache = Record<
  string,
  ReferenceOwnerFallback | undefined
>;

export function getCachedReferenceOwners(): ReferenceOwnerCache {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(REFERENCE_OWNER_CACHE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as ReferenceOwnerCache;

    if (parsedValue && typeof parsedValue === "object") {
      return parsedValue;
    }
  } catch {
    window.localStorage.removeItem(REFERENCE_OWNER_CACHE_KEY);
  }

  return {};
}

export function rememberReferenceOwner(
  referenceId: string,
  owner?: ReferenceOwnerFallback | null,
) {
  if (typeof window === "undefined" || !owner) {
    return {};
  }

  const nextOwners = {
    ...getCachedReferenceOwners(),
    [referenceId]: {
      email: owner.email ?? null,
      id: owner.id ?? null,
      name: owner.name ?? null,
    },
  };

  window.localStorage.setItem(
    REFERENCE_OWNER_CACHE_KEY,
    JSON.stringify(nextOwners),
  );

  return nextOwners;
}
