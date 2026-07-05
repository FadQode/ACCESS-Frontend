import { apiClient } from "@/core/dashboard/model/api/client";
import {
  referenceFileUrlResponseSchema,
  referenceResponseSchema,
  referencesResponseSchema,
  referenceTagsResponseSchema,
} from "../schemas/reference.schema";
import type {
  CreateFileReferenceInput,
  CreateLinkReferenceInput,
  CreateTextReferenceInput,
  GetReferencesParams,
  ReferenceFileUrl,
  ReferenceItem,
  ReferenceListResult,
  ReferenceTag,
  UpdateReferenceInput,
} from "../types/reference.types";

function compactParams(params?: GetReferencesParams) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

function appendOptionalFormValue(
  formData: FormData,
  key: string,
  value?: string | null,
) {
  if (value && value.trim().length > 0) {
    formData.append(key, value);
  }
}

export async function getReferences(
  params?: GetReferencesParams,
): Promise<ReferenceListResult> {
  const response = await apiClient.get<unknown>("/references", {
    params: compactParams(params),
  });

  return referencesResponseSchema.parse(response);
}

export async function getReferenceById(id: string): Promise<ReferenceItem> {
  const response = await apiClient.get<unknown>(`/references/${id}`);

  return referenceResponseSchema.parse(response);
}

export async function createLinkReference(
  input: CreateLinkReferenceInput,
): Promise<ReferenceItem> {
  const response = await apiClient.post<unknown>("/references", {
    category: input.category || null,
    content: input.description || null,
    createdByEmail: input.createdByEmail ?? null,
    createdByName: input.createdByName ?? null,
    sourceType: "external_link",
    tags: input.tags ?? [],
    title: input.title,
    uploadedByEmail: input.createdByEmail ?? null,
    uploadedByName: input.createdByName ?? null,
    url: input.url,
  });

  return referenceResponseSchema.parse(response);
}

export async function createTextReference(
  input: CreateTextReferenceInput,
): Promise<ReferenceItem> {
  const response = await apiClient.post<unknown>("/references", {
    category: input.category || null,
    content: input.description,
    createdByEmail: input.createdByEmail ?? null,
    createdByName: input.createdByName ?? null,
    sourceType: "internal_note",
    tags: input.tags ?? [],
    title: input.title,
    uploadedByEmail: input.createdByEmail ?? null,
    uploadedByName: input.createdByName ?? null,
    url: null,
  });

  return referenceResponseSchema.parse(response);
}

export async function createFileReference(
  input: CreateFileReferenceInput,
): Promise<ReferenceItem> {
  const formData = new FormData();

  formData.append("file", input.file);
  formData.append("title", input.title);
  appendOptionalFormValue(formData, "category", input.category);
  appendOptionalFormValue(formData, "content", input.description);
  appendOptionalFormValue(formData, "createdByEmail", input.createdByEmail);
  appendOptionalFormValue(formData, "createdByName", input.createdByName);
  appendOptionalFormValue(formData, "uploadedByEmail", input.createdByEmail);
  appendOptionalFormValue(formData, "uploadedByName", input.createdByName);

  if (input.tags && input.tags.length > 0) {
    formData.append("tags", input.tags.join(","));
  }

  const response = await apiClient.post<unknown>(
    "/references/upload",
    formData,
  );

  return referenceResponseSchema.parse(response);
}

export async function updateReference(
  id: string,
  input: UpdateReferenceInput,
): Promise<ReferenceItem> {
  const response = await apiClient.patch<unknown>(`/references/${id}`, {
    category: input.category || null,
    content: input.description ?? null,
    tags: input.tags,
    title: input.title,
    url: input.url,
  });

  return referenceResponseSchema.parse(response);
}

export async function archiveReference(id: string): Promise<ReferenceItem> {
  const response = await apiClient.post<unknown>(
    `/references/${id}/archive`,
    {},
  );

  return referenceResponseSchema.parse(response);
}

export async function getReferenceFileUrl(
  id: string,
): Promise<ReferenceFileUrl> {
  const response = await apiClient.get<unknown>(`/references/${id}/file-url`);

  return referenceFileUrlResponseSchema.parse(response);
}

export async function getReferenceTags(): Promise<ReferenceTag[]> {
  const response = await apiClient.get<unknown>("/references/tags");

  return referenceTagsResponseSchema.parse(response).tags;
}
