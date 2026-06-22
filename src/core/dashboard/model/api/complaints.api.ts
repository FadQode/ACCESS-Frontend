import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import type {
  PaginatedData,
  PaginationMeta,
} from "@/core/dashboard/model/types/api.types";
import type {
  Complaint,
  ComplaintFilters,
} from "@/core/dashboard/model/types/complaint.types";

const rawComplaintSchema = z
  .object({
    category: z.string().optional(),
    complaintText: z.string().optional(),
    complaint_text: z.string().optional(),
    complainerContact: z.string().nullable().optional(),
    complainer_contact: z.string().nullable().optional(),
    complainerName: z.string().nullable().optional(),
    complainer_name: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    created_at: z.string().optional(),
    id: z.union([z.string(), z.number()]).transform((value) => String(value)),
    referenceNo: z.string().optional(),
    reference_no: z.string().optional(),
    referenceNumber: z.string().optional(),
    resolvedAt: z.string().nullable().optional(),
    resolved_at: z.string().nullable().optional(),
    source: z.string().optional(),
    sourceHandle: z.string().nullable().optional(),
    sourceUrl: z.string().nullable().optional(),
    source_handle: z.string().nullable().optional(),
    source_url: z.string().nullable().optional(),
    status: z.string().optional(),
    submittedAt: z.string().optional(),
    submitted_at: z.string().optional(),
    trackingToken: z.string().nullable().optional(),
    tracking_token: z.string().nullable().optional(),
    updatedAt: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .transform<Complaint>((value) => ({
    category: value.category ?? "uncategorized",
    complaintText:
      value.complaintText ?? value.complaint_text ?? "No complaint text.",
    complainerContact: value.complainerContact ?? value.complainer_contact,
    complainerName: value.complainerName ?? value.complainer_name,
    createdAt: value.createdAt ?? value.created_at,
    id: value.id,
    referenceNo:
      value.referenceNo ??
      value.reference_no ??
      value.referenceNumber ??
      value.id,
    resolvedAt: value.resolvedAt ?? value.resolved_at,
    source: value.source ?? "unknown",
    sourceHandle: value.sourceHandle ?? value.source_handle,
    sourceUrl: value.sourceUrl ?? value.source_url,
    status: value.status ?? "submitted",
    submittedAt: value.submittedAt ?? value.submitted_at,
    trackingToken: value.trackingToken ?? value.tracking_token,
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
    limit: value.limit ?? 10,
    page: value.page ?? 1,
    total: value.total ?? 0,
    totalPages: value.totalPages ?? value.total_pages ?? 1,
  }));

const complaintsResponseSchema = z
  .union([
    z.array(rawComplaintSchema),
    z.object({
      complaints: z.array(rawComplaintSchema).optional(),
      items: z.array(rawComplaintSchema).optional(),
      pagination: paginationSchema.optional(),
    }),
  ])
  .transform<PaginatedData<Complaint>>((value) => {
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

    const items = value.items ?? value.complaints ?? [];

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

function compactFilters(filters?: ComplaintFilters) {
  if (!filters) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function getComplaints(
  filters?: ComplaintFilters,
): Promise<PaginatedData<Complaint>> {
  const response = await apiClient.get<unknown>("/complaints", {
    params: compactFilters(filters),
  });

  return complaintsResponseSchema.parse(response);
}

export async function getComplaintById(id: string): Promise<Complaint> {
  const response = await apiClient.get<unknown>(`/complaints/${id}`);

  return rawComplaintSchema.parse(response);
}
