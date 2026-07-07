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
  "ticket_booking",
  "app_error",
  "account",
  "payment",
  "app_update",
  "no_response_cs",
  "refund_cancel",
  "queue_problem",
  "other",
  "lost_item",
  "facility",
]);

export const referenceStatusSchema = z.enum(["active", "draft", "archived"]);

const nullableStringSchema = z.string().nullable().optional();
export const MAX_REFERENCE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const rawReferenceUserSchema = z
  .object({
    email: nullableStringSchema,
    id: z.string().optional(),
    name: nullableStringSchema,
    username: nullableStringSchema,
  })
  .passthrough()
  .nullable()
  .optional();

export const rawReferenceSchema = z
  .object({
    category: referenceCategorySchema.nullable().optional(),
    content: nullableStringSchema,
    createdAt: z.string(),
    createdBy: z.string().nullable().optional(),
    createdByEmail: nullableStringSchema,
    createdByName: nullableStringSchema,
    createdByUser: rawReferenceUserSchema,
    created_by: z.string().nullable().optional(),
    created_by_email: nullableStringSchema,
    created_by_name: nullableStringSchema,
    created_by_user: rawReferenceUserSchema,
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
    uploadedBy: rawReferenceUserSchema,
    uploadedByEmail: nullableStringSchema,
    uploadedByName: nullableStringSchema,
    uploaded_by: rawReferenceUserSchema,
    uploaded_by_email: nullableStringSchema,
    uploaded_by_name: nullableStringSchema,
    version: z.string().default("1"),
  })
  .passthrough()
  .transform<ReferenceItem>((value) => {
    const createdBy = value.createdBy ?? value.created_by ?? null;
    const creator =
      value.uploadedBy ??
      value.uploaded_by ??
      value.createdByUser ??
      value.created_by_user ??
      null;
    const creatorName =
      creator?.name ??
      creator?.username ??
      value.uploadedByName ??
      value.uploaded_by_name ??
      value.createdByName ??
      value.created_by_name ??
      null;
    const creatorEmail =
      creator?.email ??
      value.uploadedByEmail ??
      value.uploaded_by_email ??
      value.createdByEmail ??
      value.created_by_email ??
      null;
    const creatorId = creator?.id ?? createdBy;

    return {
      category: value.category ?? null,
      createdAt: value.createdAt,
      createdBy,
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
      uploadedBy: creatorId
        ? {
            email: creatorEmail,
            id: creatorId,
            name: creatorName,
          }
        : null,
      url: value.url ?? null,
      version: value.version,
    };
  });

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
    mode: z.enum(["file", "link", "text"]),
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

    if (
      value.mode === "text" &&
      (!value.description || value.description.trim().length === 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "Isi teks referensi wajib diisi.",
        path: ["description"],
      });
    }
  });

export type ReferenceFormValues = z.infer<typeof referenceFormSchema>;
