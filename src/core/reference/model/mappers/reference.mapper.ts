import type {
  ReferenceDisplayType,
  ReferenceItem,
  ReferenceSourceType,
} from "../types/reference.types";

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

export function getReferenceOwner(reference: ReferenceItem) {
  if (reference.uploadedBy?.name) {
    return reference.uploadedBy.name;
  }

  if (reference.uploadedBy?.email) {
    return reference.uploadedBy.email;
  }

  if (reference.createdBy) {
    return reference.createdBy;
  }

  return "Internal";
}
