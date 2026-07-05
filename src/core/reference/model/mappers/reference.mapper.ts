import type {
  ReferenceDisplayType,
  ReferenceItem,
  ReferenceSourceType,
} from "../types/reference.types";

export type ReferenceOwnerFallback = {
  email?: string | null;
  id?: string | null;
  name?: string | null;
};

export type ReferenceOwnerContext = {
  currentUser?: ReferenceOwnerFallback | null;
  ownersByReferenceId?: Record<string, ReferenceOwnerFallback | undefined>;
  usersById?: Record<string, ReferenceOwnerFallback | undefined>;
};

export function getReferenceDisplayType(
  sourceType: ReferenceSourceType,
  metadata?: {
    fileName?: string | null;
    fileUrl?: string | null;
    mimeType?: string | null;
    url?: string | null;
  },
): ReferenceDisplayType {
  if (
    sourceType === "uploaded_file" ||
    Boolean(metadata?.fileUrl) ||
    Boolean(metadata?.fileName) ||
    Boolean(metadata?.mimeType)
  ) {
    return "file";
  }

  if (sourceType === "external_link" || Boolean(metadata?.url)) {
    return "link";
  }

  return "text";
}

export function dedupeTags(tags: string[]) {
  return Array.from(
    new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );
}

export function getReferenceOwner(
  reference: ReferenceItem,
  context?: ReferenceOwnerContext | ReferenceOwnerFallback | null,
) {
  const ownerContext = normalizeReferenceOwnerContext(context);
  const ownerId = reference.uploadedBy?.id ?? reference.createdBy ?? null;

  if (reference.uploadedBy?.name) {
    return reference.uploadedBy.name;
  }

  if (reference.uploadedBy?.email) {
    return reference.uploadedBy.email;
  }

  const cachedOwner = ownerContext.ownersByReferenceId?.[reference.id];

  if (cachedOwner?.name) {
    return cachedOwner.name;
  }

  if (cachedOwner?.email) {
    return cachedOwner.email;
  }

  const owner = ownerId ? ownerContext.usersById?.[ownerId] : undefined;

  if (owner?.name) {
    return owner.name;
  }

  if (owner?.email) {
    return owner.email;
  }

  if (ownerContext.currentUser?.id && ownerId === ownerContext.currentUser.id) {
    return (
      ownerContext.currentUser.name || ownerContext.currentUser.email || "User"
    );
  }

  if (reference.createdBy) {
    if (isLikelyUuid(reference.createdBy)) {
      return "Internal";
    }

    return reference.createdBy;
  }

  return "Internal";
}

function isLikelyUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeReferenceOwnerContext(
  context?: ReferenceOwnerContext | ReferenceOwnerFallback | null,
): ReferenceOwnerContext {
  if (!context) {
    return {};
  }

  if (isReferenceOwnerContext(context)) {
    return context;
  }

  return {
    currentUser: context,
  };
}

function isReferenceOwnerContext(
  context: ReferenceOwnerContext | ReferenceOwnerFallback,
): context is ReferenceOwnerContext {
  return (
    "currentUser" in context ||
    "ownersByReferenceId" in context ||
    "usersById" in context
  );
}
