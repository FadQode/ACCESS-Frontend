import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import { takeActionSchema } from "@/core/dashboard/model/schemas/action-request.schema";
import type {
  ActionRequest,
  ActionRequestFilters,
  ActionRequestLinkedComplaint,
  ActionRequestStatus,
  TakeActionRequest,
} from "@/core/dashboard/model/types/action-request.types";
import type {
  PaginatedData,
  PaginationMeta,
} from "@/core/dashboard/model/types/api.types";
import { rawActionRequestReferenceSchema } from "@/core/reference/model/schemas/reference-attachment.schema";

const idSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

const linkedComplaintSchema = z
  .object({
    actionRequestId: idSchema.optional(),
    action_request_id: idSchema.optional(),
    agentId: idSchema.nullable().optional(),
    agent_id: idSchema.nullable().optional(),
    complaintId: idSchema.optional(),
    complaintText: z.string().optional(),
    complaint_id: idSchema.optional(),
    complaint_text: z.string().optional(),
    id: idSchema,
    linkedAt: z.string().optional(),
    linked_at: z.string().optional(),
    ticketId: idSchema.optional(),
    ticketStatus: z.string().optional(),
    ticket_id: idSchema.optional(),
    ticket_status: z.string().optional(),
  })
  .transform<ActionRequestLinkedComplaint>((value) => ({
    actionRequestId: value.actionRequestId ?? value.action_request_id,
    agentId: value.agentId ?? value.agent_id,
    complaintId: value.complaintId ?? value.complaint_id,
    complaintText: value.complaintText ?? value.complaint_text,
    id: value.id,
    linkedAt: value.linkedAt ?? value.linked_at,
    ticketId: value.ticketId ?? value.ticket_id,
    ticketStatus: value.ticketStatus ?? value.ticket_status,
  }));

const rawActionRequestSchema = z
  .object({
    actionTaken: z.string().nullable().optional(),
    action_taken: z.string().nullable().optional(),
    category: z.string().optional(),
    clusterLabel: z.string().optional(),
    cluster_label: z.string().optional(),
    createdAt: z.string().optional(),
    created_at: z.string().optional(),
    groupingKey: z.string().nullable().optional(),
    grouping_key: z.string().nullable().optional(),
    id: idSchema,
    issueKey: z.string().nullable().optional(),
    issueSummary: z.string().nullable().optional(),
    issue_key: z.string().nullable().optional(),
    issue_summary: z.string().nullable().optional(),
    linkedComplaints: z.array(linkedComplaintSchema).optional(),
    linked_complaints: z.array(linkedComplaintSchema).optional(),
    managerId: idSchema.nullable().optional(),
    manager_id: idSchema.nullable().optional(),
    referenceNo: z.string().optional(),
    reference_no: z.string().optional(),
    references: z.array(rawActionRequestReferenceSchema).optional(),
    resolvedAt: z.string().nullable().optional(),
    resolved_at: z.string().nullable().optional(),
    raisedAt: z.string().optional(),
    raised_at: z.string().optional(),
    status: z.string().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
    closureMessage: z.string().nullable().optional(),
    closure_message: z.string().nullable().optional(),
  })
  .transform<ActionRequest>((value) => ({
    actionTaken: value.actionTaken ?? value.action_taken,
    category: value.category ?? "other",
    closureMessage: value.closureMessage ?? value.closure_message,
    clusterLabel:
      value.clusterLabel ??
      value.cluster_label ??
      value.issueSummary ??
      value.issue_summary ??
      value.referenceNo ??
      value.reference_no ??
      value.id,
    createdAt: value.createdAt ?? value.created_at,
    groupingKey: value.groupingKey ?? value.grouping_key,
    id: value.id,
    issueKey: value.issueKey ?? value.issue_key,
    issueSummary: value.issueSummary ?? value.issue_summary,
    linkedComplaints: value.linkedComplaints ?? value.linked_complaints ?? [],
    managerId: value.managerId ?? value.manager_id,
    raisedAt: value.raisedAt ?? value.raised_at,
    referenceNo: value.referenceNo ?? value.reference_no,
    references: value.references ?? [],
    resolvedAt: value.resolvedAt ?? value.resolved_at,
    status: normalizeActionRequestStatus(value.status),
    updatedAt: value.updatedAt ?? value.updated_at,
  }));

const paginationSchema = z
  .object({
    limit: z.number().optional(),
    page: z.number().optional(),
    total: z.number().optional(),
    totalPages: z.number().optional(),
    total_pages: z.number().optional(),
  })
  .transform<PaginationMeta>((value) => ({
    limit: value.limit ?? 20,
    page: value.page ?? 1,
    total: value.total ?? 0,
    totalPages: value.totalPages ?? value.total_pages ?? 1,
  }));

const actionRequestsResponseSchema = z
  .union([
    z.array(rawActionRequestSchema),
    z.object({
      actionRequests: z.array(rawActionRequestSchema).optional(),
      action_requests: z.array(rawActionRequestSchema).optional(),
      items: z.array(rawActionRequestSchema).optional(),
      pagination: paginationSchema.optional(),
    }),
  ])
  .transform<PaginatedData<ActionRequest>>((value) => {
    if (Array.isArray(value)) {
      return {
        items: value,
        pagination: {
          limit: value.length,
          page: 1,
          total: value.length,
          totalPages: 1,
        },
      };
    }

    const items =
      value.items ?? value.actionRequests ?? value.action_requests ?? [];

    return {
      items,
      pagination: value.pagination ?? {
        limit: items.length,
        page: 1,
        total: items.length,
        totalPages: 1,
      },
    };
  });

const actionRequestDetailResponseSchema = z
  .union([
    rawActionRequestSchema,
    z.object({
      actionRequest: rawActionRequestSchema,
    }),
    z.object({
      action_request: rawActionRequestSchema,
    }),
  ])
  .transform<ActionRequest>((value) => {
    if ("actionRequest" in value) {
      return value.actionRequest;
    }

    if ("action_request" in value) {
      return value.action_request;
    }

    return value;
  });

function normalizeActionRequestStatus(status?: string): ActionRequestStatus {
  if (
    status === "action_planned" ||
    status === "action_taken" ||
    status === "closed" ||
    status === "open" ||
    status === "reviewing"
  ) {
    return status;
  }

  return "open";
}

function compactFilters(filters?: ActionRequestFilters) {
  if (!filters) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function getActionRequests(
  filters?: ActionRequestFilters,
): Promise<PaginatedData<ActionRequest>> {
  const response = await apiClient.get<unknown>("/action-requests", {
    params: compactFilters(filters),
  });

  return actionRequestsResponseSchema.parse(response);
}

export async function getActionRequestById(id: string): Promise<ActionRequest> {
  const response = await apiClient.get<unknown>(`/action-requests/${id}`);

  return actionRequestDetailResponseSchema.parse(response);
}

export async function takeAction(
  id: string,
  input: TakeActionRequest,
): Promise<ActionRequest> {
  const payload = takeActionSchema.parse(input);
  const response = await apiClient.patch<unknown>(
    `/action-requests/${id}/take-action`,
    payload,
  );

  return actionRequestDetailResponseSchema.parse(response);
}
