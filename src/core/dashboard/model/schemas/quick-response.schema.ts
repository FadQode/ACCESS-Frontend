import { z } from "zod";

export const quickResponseOutcomeSchema = z.enum([
  "copy_only",
  "sent_resolved",
  "sent_hea_action",
]);

export const quickResponseTargetSchema = z.enum([
  "public_reply",
  "dm",
  "app_review",
  "internal_note",
]);

export const quickResponseSourceSchema = z.enum([
  "web_form",
  "twitter",
  "instagram",
  "facebook",
  "google_play",
  "app_store",
  "other",
]);

export const quickResponseCategorySchema = z.enum([
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

const nullableTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const sourceUrlSchema = z
  .union([z.string().trim().url("URL sumber tidak valid."), z.literal("")])
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const createQuickResponseSchema = z.object({
  complaint: z.object({
    category: quickResponseCategorySchema,
    complaintText: z.string().trim().min(10, "Keluhan minimal 10 karakter."),
    complainerContact: nullableTextSchema,
    complainerName: nullableTextSchema,
    source: quickResponseSourceSchema.optional(),
    sourceHandle: nullableTextSchema,
    sourceUrl: sourceUrlSchema,
  }),
  response: z.object({
    finalResponse: z
      .string()
      .trim()
      .min(1, "Balasan akhir wajib diisi.")
      .nullable()
      .optional(),
    outcome: quickResponseOutcomeSchema,
    responseTarget: quickResponseTargetSchema,
    responseTone: nullableTextSchema,
    selectedApologize: nullableTextSchema,
    selectedEmpathize: nullableTextSchema,
    selectedHear: nullableTextSchema,
    selectedTakeAction: nullableTextSchema,
  }),
});

export type CreateQuickResponseSchemaInput = z.input<
  typeof createQuickResponseSchema
>;
