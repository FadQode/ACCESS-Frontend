import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import { createQuickResponseSchema } from "@/core/dashboard/model/schemas/quick-response.schema";
import type {
  CreateQuickResponseRequest,
  CreateQuickResponseResponse,
  QuickResponseCategory,
  QuickResponseOutcome,
} from "@/core/dashboard/model/types/quick-response.types";

const rawQuickResponseResponseSchema = z
  .object({
    complaint: z.object({
      category: z.string().optional(),
      complaintText: z.string().optional(),
      id: z.union([z.string(), z.number()]).transform((value) => String(value)),
      referenceNo: z.string().optional(),
      resolvedAt: z.string().nullable().optional(),
      status: z.string().optional(),
      submittedAt: z.string().optional(),
    }),
    quickResponseSession: z.object({
      createdAt: z.string().optional(),
      finalResponse: z.string().nullable().optional(),
      id: z.union([z.string(), z.number()]).transform((value) => String(value)),
      outcome: z.enum(["copy_only", "sent_resolved", "sent_hea_action"]),
    }),
    requiresFollowUp: z.boolean().optional(),
    ticket: z
      .object({
        id: z
          .union([z.string(), z.number()])
          .transform((value) => String(value)),
        priority: z.string().optional(),
        status: z.string().optional(),
      })
      .nullable()
      .optional(),
  })
  .transform<CreateQuickResponseResponse>((value) => ({
    complaint: {
      category: value.complaint.category as QuickResponseCategory | undefined,
      complaintText: value.complaint.complaintText,
      id: value.complaint.id,
      referenceNo: value.complaint.referenceNo,
      resolvedAt: value.complaint.resolvedAt,
      status: value.complaint.status,
      submittedAt: value.complaint.submittedAt,
    },
    quickResponseSession: {
      createdAt: value.quickResponseSession.createdAt,
      finalResponse: value.quickResponseSession.finalResponse,
      id: value.quickResponseSession.id,
      outcome: value.quickResponseSession.outcome as QuickResponseOutcome,
    },
    requiresFollowUp: value.requiresFollowUp,
    ticket: value.ticket ?? null,
  }));

export async function createQuickResponse(
  input: CreateQuickResponseRequest,
): Promise<CreateQuickResponseResponse> {
  const payload = createQuickResponseSchema.parse(input);
  const response = await apiClient.post<unknown>("/quick-responses", payload);

  return rawQuickResponseResponseSchema.parse(response);
}
