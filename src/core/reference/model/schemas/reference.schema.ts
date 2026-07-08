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
    createdAt: z.string().optional(),
    createdBy: z.string().nullable().optional(),
    createdByEmail: nullableStringSchema,
    createdByName: nullableStringSchema,
    createdByUser: rawReferenceUserSchema,
    created_at: z.string().optional(),
    created_by: z.string().nullable().optional(),
    created_by_email: nullableStringSchema,
    created_by_name: nullableStringSchema,
    created_by_user: rawReferenceUserSchema,
    fileMimeType: nullableStringSchema,
    fileName: nullableStringSchema,
    fileSize: z.number().nullable().optional(),
    fileUrl: nullableStringSchema,
    file_mime_type: nullableStringSchema,
    file_name: nullableStringSchema,
    file_size: z.number().nullable().optional(),
    file_url: nullableStringSchema,
    id: z.string(),
    sourceType: referenceSourceTypeSchema.optional(),
    source_type: referenceSourceTypeSchema.optional(),
    status: referenceStatusSchema.optional(),
    tags: z.array(z.string()).default([]),
    title: z.string(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
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
    const fileMimeType = value.fileMimeType ?? value.file_mime_type ?? null;
    const fileName = value.fileName ?? value.file_name ?? null;
    const fileSize = value.fileSize ?? value.file_size ?? null;
    const fileUrl = value.fileUrl ?? value.file_url ?? null;
    const sourceType = value.sourceType ?? value.source_type ?? "internal_note";

    return {
      category: value.category ?? null,
      createdAt: value.createdAt ?? value.created_at ?? "",
      createdBy,
      description: value.content ?? null,
      displayType: getReferenceDisplayType(sourceType, {
        fileName,
        fileUrl,
        mimeType: fileMimeType,
        url: value.url,
      }),
      fileName,
      fileSize,
      fileUrl,
      id: value.id,
      mimeType: fileMimeType,
      sourceType,
      status: value.status ?? "active",
      tags: dedupeTags(value.tags),
      title: value.title,
      updatedAt: value.updatedAt ?? value.updated_at ?? "",
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
    expiresIn: z.number().optional(),
    expires_in: z.number().optional(),
    signedUrl: z.string().url().optional(),
    signed_url: z.string().url().optional(),
  })
  .transform<ReferenceFileUrl>((value, context) => {
    const signedUrl = value.signedUrl ?? value.signed_url;

    if (!signedUrl) {
      context.addIssue({
        code: "custom",
        message: "Signed URL referensi tidak tersedia.",
      });
      return z.NEVER;
    }

    return {
      expiresIn: value.expiresIn ?? value.expires_in ?? 0,
      signedUrl,
    };
  });

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
