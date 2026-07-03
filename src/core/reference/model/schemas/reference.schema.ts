import { z } from "zod";
import {
  dedupeTags,
  getReferenceDisplayType,
} from "../mappers/reference.mapper";
import type {
  ReferenceFileUrl,
  ReferenceItem,
  ReferenceListResult,
  ReferenceTag,
} from "../types/reference.types";

export const referenceSourceTypeSchema = z.enum([
  "sop",
  "faq",
  "policy",
  "guide",
  "template",
  "known_issue",
  "external_link",
  "uploaded_file",
  "previous_action",
  "internal_note",
]);

export const referenceCategorySchema = z.enum([
  "delay",
  "refund",
  "cancellation",
  "lost_item",
  "facility",
  "payment",
  "account",
  "app_error",
  "other",
]);

export const referenceStatusSchema = z.enum(["active", "draft", "archived"]);

const nullableStringSchema = z.string().nullable().optional();
export const MAX_REFERENCE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const rawReferenceSchema = z
  .object({
    category: referenceCategorySchema.nullable().optional(),
    content: nullableStringSchema,
    createdAt: z.string(),
    createdBy: z.string().nullable().optional(),
    fileMimeType: nullableStringSchema,
    fileName: nullableStringSchema,
    fileSize: z.number().nullable().optional(),
    fileUrl: nullableStringSchema,
    id: z.string(),
    sourceType: referenceSourceTypeSchema,
    status: referenceStatusSchema,
    tags: z.array(z.string()).default([]),
    title: z.string(),
    updatedAt: z.string(),
    url: nullableStringSchema,
    version: z.string().default("1"),
  })
  .passthrough()
  .transform<ReferenceItem>((value) => ({
    category: value.category ?? null,
    createdAt: value.createdAt,
    createdBy: value.createdBy ?? null,
    description: value.content ?? null,
    displayType: getReferenceDisplayType(value.sourceType, {
      fileName: value.fileName,
      fileUrl: value.fileUrl,
      mimeType: value.fileMimeType,
      url: value.url,
    }),
    fileName: value.fileName ?? null,
    fileSize: value.fileSize ?? null,
    fileUrl: value.fileUrl ?? null,
    id: value.id,
    mimeType: value.fileMimeType ?? null,
    sourceType: value.sourceType,
    status: value.status,
    tags: dedupeTags(value.tags),
    title: value.title,
    updatedAt: value.updatedAt,
    uploadedBy: value.createdBy
      ? {
          id: value.createdBy,
        }
      : null,
    url: value.url ?? null,
    version: value.version,
  }));

const paginationSchema = z.object({
  limit: z.number().default(20),
  page: z.number().default(1),
  total: z.number().default(0),
  totalPages: z.number().default(1),
});

export const referencesResponseSchema = z
  .object({
    items: z.array(rawReferenceSchema).default([]),
    pagination: paginationSchema,
  })
  .transform<ReferenceListResult>((value) => value);

export const referenceResponseSchema = z
  .union([
    rawReferenceSchema,
    z.object({
      reference: rawReferenceSchema,
    }),
  ])
  .transform<ReferenceItem>((value) =>
    "reference" in value ? value.reference : value,
  );

export const referenceFileUrlResponseSchema = z
  .object({
    expiresIn: z.number(),
    signedUrl: z.string().url(),
  })
  .transform<ReferenceFileUrl>((value) => value);

export const referenceTagsResponseSchema = z.object({
  tags: z.array(
    z.object({
      createdAt: z.string(),
      id: z.string(),
      name: z.string(),
    }),
  ),
}) satisfies z.ZodType<{ tags: ReferenceTag[] }>;

export const referenceFormSchema = z
  .object({
    category: referenceCategorySchema.or(z.literal("")).optional(),
    description: z.string().max(5000).optional(),
    file: z.instanceof(File).optional(),
    mode: z.enum(["file", "link"]),
    tags: z.array(z.string()).max(30).optional(),
    title: z.string().trim().min(1).max(255),
    url: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.mode === "file" && !value.file) {
      context.addIssue({
        code: "custom",
        message: "File wajib dipilih.",
        path: ["file"],
      });
    }

    if (
      value.mode === "file" &&
      value.file &&
      value.file.size > MAX_REFERENCE_FILE_SIZE_BYTES
    ) {
      context.addIssue({
        code: "custom",
        message: "Ukuran file maksimal 5 MB.",
        path: ["file"],
      });
    }

    if (value.mode === "link") {
      const parsedUrl = z.string().url().safeParse(value.url);

      if (!parsedUrl.success) {
        context.addIssue({
          code: "custom",
          message: "URL referensi tidak valid.",
          path: ["url"],
        });
      }
    }
  });

export type ReferenceFormValues = z.infer<typeof referenceFormSchema>;
