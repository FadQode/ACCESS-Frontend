import { z } from "zod";
import {
  dedupeTags,
  getReferenceDisplayType,
} from "../mappers/reference.mapper";
import type {
  AttachedActionRequestReference,
  DetachReferenceResult,
} from "../types/reference-attachment.types";
import {
  referenceCategorySchema,
  referenceSourceTypeSchema,
} from "./reference.schema";

const idSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

const attachedBySchema = z
  .union([
    idSchema.transform((id) => ({
      id,
    })),
    z.object({
      email: z.string().nullable().optional(),
      id: idSchema,
      name: z.string().nullable().optional(),
    }),
  ])
  .nullable()
  .optional();

export const actionRequestReferenceUsageTypeSchema = z.enum([
  "evidence",
  "action_basis",
  "policy_support",
  "closure_support",
  "related_link",
  "internal_note",
]);

const nullableStringSchema = z.string().nullable().optional();

const rawReferenceSourceSchema = z
  .object({
    category: referenceCategorySchema.nullable().optional(),
    content: nullableStringSchema,
    fileMimeType: nullableStringSchema,
    fileName: nullableStringSchema,
    fileUrl: nullableStringSchema,
    id: idSchema,
    sourceType: referenceSourceTypeSchema,
    status: z.string().nullable().optional(),
    tags: z.array(z.string()).default([]),
    title: z.string().optional(),
    url: nullableStringSchema,
  })
  .passthrough();

export const rawActionRequestReferenceSchema = z
  .object({
    actionRequestId: idSchema.optional(),
    action_request_id: idSchema.optional(),
    attachedBy: attachedBySchema,
    attached_by: attachedBySchema,
    createdAt: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    id: idSchema,
    note: nullableStringSchema,
    referenceSource: rawReferenceSourceSchema.nullable().optional(),
    reference_source: rawReferenceSourceSchema.nullable().optional(),
    referenceSourceId: idSchema.optional(),
    reference_source_id: idSchema.optional(),
    snapshotText: nullableStringSchema,
    snapshot_text: nullableStringSchema,
    usageType: actionRequestReferenceUsageTypeSchema.optional(),
    usage_type: actionRequestReferenceUsageTypeSchema.optional(),
  })
  .passthrough()
  .transform<AttachedActionRequestReference>((value) => {
    const referenceSource = value.referenceSource ?? value.reference_source;
    const referenceSourceId =
      value.referenceSourceId ??
      value.reference_source_id ??
      referenceSource?.id;
    const sourceType = referenceSource?.sourceType ?? "internal_note";
    const url = referenceSource?.url ?? null;
    const fileName = referenceSource?.fileName ?? null;
    const fileUrl = referenceSource?.fileUrl ?? null;
    const mimeType = referenceSource?.fileMimeType ?? null;
    const snapshotText = value.snapshotText ?? value.snapshot_text ?? null;

    return {
      actionRequestId: value.actionRequestId ?? value.action_request_id,
      attachedBy: value.attachedBy ?? value.attached_by ?? null,
      category: referenceSource?.category ?? null,
      content: referenceSource?.content ?? null,
      createdAt: value.createdAt ?? value.created_at ?? null,
      displayType: getReferenceDisplayType(sourceType, {
        fileName,
        fileUrl,
        mimeType,
        url,
      }),
      fileName,
      mimeType,
      note: value.note ?? null,
      referenceLinkId: value.id,
      referenceSourceId: referenceSourceId ?? value.id,
      snapshotText,
      sourceType,
      status: referenceSource?.status ?? null,
      tags: dedupeTags(referenceSource?.tags ?? []),
      title:
        referenceSource?.title ??
        snapshotText?.slice(0, 80) ??
        `Referensi ${value.id.slice(0, 8)}`,
      url,
      usageType: value.usageType ?? value.usage_type ?? "closure_support",
    };
  });

export const actionRequestReferenceResponseSchema = z
  .union([
    rawActionRequestReferenceSchema,
    z.object({
      reference: rawActionRequestReferenceSchema,
    }),
  ])
  .transform<AttachedActionRequestReference>((value) =>
    "reference" in value ? value.reference : value,
  );

export const actionRequestReferencesResponseSchema = z
  .object({
    references: z.array(rawActionRequestReferenceSchema).default([]),
  })
  .transform<AttachedActionRequestReference[]>((value) => value.references);

export const detachReferenceResponseSchema = z
  .object({
    deleted: z.boolean(),
  })
  .transform<DetachReferenceResult>((value) => value);
