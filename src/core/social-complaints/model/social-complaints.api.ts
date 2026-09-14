import { z } from "zod";
import { apiClient } from "@/core/dashboard/model/api/client";
import type {
  PaginatedData,
  PaginationMeta,
} from "@/core/dashboard/model/types/api.types";
import type {
  SocialComplaint,
  SocialComplaintFilters,
  SocialComplaintSource,
  SocialComplaintSyncResult,
} from "./social-complaints.types";

const idSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

const rawSocialComplaintSchema = z
  .object({
    author: z.string().nullable().optional(),
    content: z.string().optional(),
    id: idSchema,
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    published_at: z.string().nullable().optional(),
    source: z.string(),
    sourceReference: z.string().optional(),
    source_reference: z.string().optional(),
    sourceUrl: z.string().nullable().optional(),
    source_url: z.string().nullable().optional(),
  })
  .transform<SocialComplaint>((value) => ({
    author: value.author ?? "Anonim",
    content: value.content ?? "",
    id: value.id,
    metadata: value.metadata ?? null,
    publishedAt: value.publishedAt ?? value.published_at ?? null,
    source: value.source as SocialComplaintSource,
    sourceReference:
      value.sourceReference ?? value.source_reference ?? value.id,
    sourceUrl: value.sourceUrl ?? value.source_url ?? null,
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
    limit: value.limit ?? 5,
    page: value.page ?? 1,
    total: value.total ?? 0,
    totalPages: value.totalPages ?? value.total_pages ?? 1,
  }));

const socialComplaintsResponseSchema = z
  .union([
    z.array(rawSocialComplaintSchema),
    z.object({
      items: z.array(rawSocialComplaintSchema).optional(),
      pagination: paginationSchema.optional(),
      socialComplaints: z.array(rawSocialComplaintSchema).optional(),
      social_complaints: z.array(rawSocialComplaintSchema).optional(),
    }),
  ])
  .transform<PaginatedData<SocialComplaint>>((value) => {
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
      value.items ?? value.socialComplaints ?? value.social_complaints ?? [];

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

function compactFilters(filters?: SocialComplaintFilters) {
  if (!filters) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
}

export async function getSocialComplaints(
  filters?: SocialComplaintFilters,
): Promise<PaginatedData<SocialComplaint>> {
  const response = await apiClient.get<unknown>("/social-complaints", {
    params: compactFilters(filters),
  });

  return socialComplaintsResponseSchema.parse(response);
}

const numericSchema = z.union([z.number(), z.string()]);

const socialComplaintSyncSchema = z
  .object({
    created: numericSchema,
    failed: numericSchema,
    fetched: numericSchema,
    source: z.enum(["google_play", "facebook", "x"]),
    unchanged: numericSchema,
  })
  .transform<SocialComplaintSyncResult>((value) => value);

export async function syncSocialComplaints(
  source: SocialComplaintSource,
): Promise<SocialComplaintSyncResult> {
  const response = await apiClient.post<unknown>("/social-complaints/sync", {
    source,
  });

  return socialComplaintSyncSchema.parse(response);
}
