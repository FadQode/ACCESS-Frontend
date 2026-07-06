import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import { finalClosureSchema } from "@/core/dashboard/model/schemas/final-closure.schema";
import { createQuickResponseSchema } from "@/core/dashboard/model/schemas/quick-response.schema";
import type {
  FinalClosureRequest,
  FinalClosureResponse,
} from "@/core/dashboard/model/types/final-closure.types";
import type {
  CreateQuickResponseRequest,
  CreateQuickResponseResponse,
  QuickResponseCategory,
  QuickResponseOutcome,
  QuickResponsePreviewData,
  QuickResponsePreviewRequest,
  QuickResponsePreviewSuggestions,
} from "@/core/dashboard/model/types/quick-response.types";

const idSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

const rawQuickResponseResponseSchema = z
  .object({
    complaint: z.object({
      category: z.string().optional(),
      complaintText: z.string().optional(),
      id: idSchema,
      referenceNo: z.string().optional(),
      resolvedAt: z.string().nullable().optional(),
      status: z.string().optional(),
      submittedAt: z.string().optional(),
    }),
    quickResponseSession: z.object({
      createdAt: z.string().optional(),
      finalResponse: z.string().nullable().optional(),
      id: idSchema,
      outcome: z.enum(["copy_only", "sent_resolved", "sent_hea_action"]),
    }),
    requiresFollowUp: z.boolean().optional(),
    ticket: z
      .object({
        id: idSchema,
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

const previewSuggestionListSchema = z.array(z.string()).length(3);

const quickResponsePreviewSchema = z
  .object({
    suggestionSource: z.enum(["ai", "fallback"]),
    suggestions: z.object({
      hear: previewSuggestionListSchema,
      empathize: previewSuggestionListSchema,
      apologize: previewSuggestionListSchema,
      takeAction: previewSuggestionListSchema,
    }),
  })
  .transform<QuickResponsePreviewData>((value) => ({
    suggestionSource: value.suggestionSource,
    suggestions: value.suggestions as QuickResponsePreviewSuggestions,
  }));

const finalClosureResponseSchema = z
  .object({
    complaint: z.object({
      id: idSchema,
      resolvedAt: z.string().nullable().optional(),
      resolved_at: z.string().nullable().optional(),
      status: z.string().optional(),
    }),
    quickResponseSession: z.object({
      createdAt: z.string().optional(),
      created_at: z.string().optional(),
      finalResponse: z.string().nullable(),
      final_response: z.string().nullable().optional(),
      id: idSchema,
      outcome: z.literal("sent_resolved"),
    }),
    quick_response_session: z
      .object({
        createdAt: z.string().optional(),
        created_at: z.string().optional(),
        finalResponse: z.string().nullable().optional(),
        final_response: z.string().nullable().optional(),
        id: idSchema,
        outcome: z.literal("sent_resolved"),
      })
      .optional(),
    ticket: z
      .object({
        id: idSchema,
        status: z.string().optional(),
      })
      .nullable()
      .optional(),
  })
  .transform<FinalClosureResponse>((value) => {
    const quickResponseSession =
      value.quick_response_session ?? value.quickResponseSession;

    return {
      complaint: {
        id: value.complaint.id,
        resolvedAt:
          value.complaint.resolvedAt ?? value.complaint.resolved_at ?? null,
        status: value.complaint.status,
      },
      quickResponseSession: {
        createdAt:
          quickResponseSession.createdAt ?? quickResponseSession.created_at,
        finalResponse:
          quickResponseSession.finalResponse ??
          quickResponseSession.final_response ??
          null,
        id: quickResponseSession.id,
        outcome: quickResponseSession.outcome,
      },
      ticket: value.ticket ?? null,
    };
  });

export async function createQuickResponse(
  input: CreateQuickResponseRequest,
): Promise<CreateQuickResponseResponse> {
  const payload = createQuickResponseSchema.parse(input);
  const response = await apiClient.post<unknown>("/quick-responses", payload);

  return rawQuickResponseResponseSchema.parse(response);
}

export async function previewQuickResponse(
  input: QuickResponsePreviewRequest,
): Promise<QuickResponsePreviewData> {
  const payload = {
    complaintText: input.complaintText.trim(),
    ...(input.category ? { category: input.category } : {}),
    ...(input.responseTarget ? { responseTarget: input.responseTarget } : {}),
    ...(input.responseTone ? { responseTone: input.responseTone } : {}),
  };
  const response = await apiClient.post<unknown>(
    "/quick-responses/preview",
    payload,
  );

  return quickResponsePreviewSchema.parse(response);
}

export async function createComplaintQuickResponse(
  input: FinalClosureRequest,
): Promise<FinalClosureResponse> {
  const payload = finalClosureSchema.parse(input);
  const response = await apiClient.post<unknown>(
    `/complaints/${payload.complaintId}/quick-responses`,
    {
      finalResponse: payload.response.finalResponse,
      outcome: payload.response.outcome,
      references: payload.references,
      responseTarget: payload.response.responseTarget,
      responseTone: payload.response.responseTone,
      selectedApologize: payload.response.selectedApologize,
      selectedEmpathize: payload.response.selectedEmpathize,
      selectedHear: payload.response.selectedHear,
      selectedTakeAction: payload.response.selectedTakeAction,
      ticketId: payload.ticketId,
    },
  );

  return finalClosureResponseSchema.parse(response);
}
