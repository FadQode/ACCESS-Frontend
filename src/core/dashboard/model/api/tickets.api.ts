import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import type {
  PaginatedData,
  PaginationMeta,
} from "@/core/dashboard/model/types/api.types";
import type {
  Ticket,
  TicketFilters,
} from "@/core/dashboard/model/types/ticket.types";

const idSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

const rawTicketSchema = z
  .object({
    actionRequest: z
      .object({
        actionTaken: z.string().nullable().optional(),
        action_taken: z.string().nullable().optional(),
        clusterLabel: z.string().optional(),
        cluster_label: z.string().optional(),
        closureMessage: z.string().nullable().optional(),
        closure_message: z.string().nullable().optional(),
        id: idSchema,
        referenceNo: z.string().optional(),
        reference_no: z.string().optional(),
        status: z.string().optional(),
      })
      .nullable()
      .optional(),
    action_request: z
      .object({
        actionTaken: z.string().nullable().optional(),
        action_taken: z.string().nullable().optional(),
        clusterLabel: z.string().optional(),
        cluster_label: z.string().optional(),
        closureMessage: z.string().nullable().optional(),
        closure_message: z.string().nullable().optional(),
        id: idSchema,
        referenceNo: z.string().optional(),
        reference_no: z.string().optional(),
        status: z.string().optional(),
      })
      .nullable()
      .optional(),
    agentId: idSchema.nullable().optional(),
    agent_id: idSchema.nullable().optional(),
    actionTaken: z.string().nullable().optional(),
    action_taken: z.string().nullable().optional(),
    category: z.string().optional(),
    complaintId: idSchema.optional(),
    complaintStatus: z.string().optional(),
    complaintText: z.string().optional(),
    complaint_id: idSchema.optional(),
    complaint_status: z.string().optional(),
    complaint_text: z.string().optional(),
    closureMessage: z.string().nullable().optional(),
    closureSentAt: z.string().nullable().optional(),
    closure_message: z.string().nullable().optional(),
    closure_sent_at: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    created_at: z.string().optional(),
    heaResponse: z.string().nullable().optional(),
    heaSentAt: z.string().nullable().optional(),
    hea_response: z.string().nullable().optional(),
    hea_sent_at: z.string().nullable().optional(),
    id: idSchema,
    priority: z.string().optional(),
    referenceNo: z.string().optional(),
    reference_no: z.string().optional(),
    status: z.string().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
    agent: z
      .object({
        email: z.string().optional(),
        id: idSchema.optional(),
        name: z.string().optional(),
      })
      .nullable()
      .optional(),
    managerAction: z
      .object({
        actionTaken: z.string().nullable().optional(),
        action_taken: z.string().nullable().optional(),
        closureMessage: z.string().nullable().optional(),
        closure_message: z.string().nullable().optional(),
        completedAt: z.string().nullable().optional(),
        completed_at: z.string().nullable().optional(),
        managerName: z.string().nullable().optional(),
        manager_name: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    manager_action: z
      .object({
        actionTaken: z.string().nullable().optional(),
        action_taken: z.string().nullable().optional(),
        closureMessage: z.string().nullable().optional(),
        closure_message: z.string().nullable().optional(),
        completedAt: z.string().nullable().optional(),
        completed_at: z.string().nullable().optional(),
        managerName: z.string().nullable().optional(),
        manager_name: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .transform<Ticket>((value) => {
    const actionRequest = value.actionRequest ?? value.action_request;
    const managerAction = value.managerAction ?? value.manager_action;

    return {
      actionRequest: actionRequest
        ? {
            actionTaken:
              actionRequest.actionTaken ?? actionRequest.action_taken,
            clusterLabel:
              actionRequest.clusterLabel ?? actionRequest.cluster_label,
            closureMessage:
              actionRequest.closureMessage ?? actionRequest.closure_message,
            id: actionRequest.id,
            referenceNo:
              actionRequest.referenceNo ?? actionRequest.reference_no,
            status: actionRequest.status,
          }
        : null,
      actionTaken: value.actionTaken ?? value.action_taken,
      agentId: value.agentId ?? value.agent_id,
      category: value.category,
      complaintId: value.complaintId ?? value.complaint_id ?? value.id,
      complaintStatus: value.complaintStatus ?? value.complaint_status,
      complaintText: value.complaintText ?? value.complaint_text,
      closureMessage: value.closureMessage ?? value.closure_message,
      closureSentAt: value.closureSentAt ?? value.closure_sent_at,
      createdAt: value.createdAt ?? value.created_at,
      heaResponse: value.heaResponse ?? value.hea_response,
      heaSentAt: value.heaSentAt ?? value.hea_sent_at,
      id: value.id,
      priority: value.priority,
      referenceNo: value.referenceNo ?? value.reference_no,
      status: value.status ?? "open",
      updatedAt: value.updatedAt ?? value.updated_at,
      agent: value.agent ?? null,
      managerAction: managerAction
        ? {
            actionTaken:
              managerAction.actionTaken ?? managerAction.action_taken,
            closureMessage:
              managerAction.closureMessage ?? managerAction.closure_message,
            completedAt:
              managerAction.completedAt ?? managerAction.completed_at,
            managerName:
              managerAction.managerName ?? managerAction.manager_name,
            status: managerAction.status,
          }
        : null,
    };
  });

const ticketDetailResponseSchema = z
  .union([
    rawTicketSchema,
    z.object({
      ticket: rawTicketSchema,
    }),
  ])
  .transform<Ticket>((value) => ("ticket" in value ? value.ticket : value));

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

const ticketsResponseSchema = z
  .union([
    z.array(rawTicketSchema),
    z.object({
      items: z.array(rawTicketSchema).optional(),
      pagination: paginationSchema.optional(),
      tickets: z.array(rawTicketSchema).optional(),
    }),
  ])
  .transform<PaginatedData<Ticket>>((value) => {
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

    const items = value.items ?? value.tickets ?? [];

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

function compactFilters(filters?: TicketFilters) {
  if (!filters) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function getTickets(
  filters?: TicketFilters,
): Promise<PaginatedData<Ticket>> {
  const response = await apiClient.get<unknown>("/tickets", {
    params: compactFilters(filters),
  });

  return ticketsResponseSchema.parse(response);
}

export async function getTicketById(id: string): Promise<Ticket> {
  const response = await apiClient.get<unknown>(`/tickets/${id}`);

  return ticketDetailResponseSchema.parse(response);
}

export async function escalateTicket(id: string): Promise<Ticket> {
  const response = await apiClient.post<unknown>(`/tickets/${id}/escalate`, {});

  return ticketDetailResponseSchema.parse(response);
}
