"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/dashboard/model/query-keys";
import {
  getSocialComplaints,
  syncSocialComplaints,
} from "../model/social-complaints.api";
import type { SocialComplaintSource } from "../model/social-complaints.types";

export const SOCIAL_COMPLAINTS_PAGE_SIZE = 5;

export function useSocialComplaints({
  page = 1,
  source,
}: {
  page?: number;
  source?: SocialComplaintSource;
} = {}) {
  const query = useQuery({
    placeholderData: (previousData) => previousData,
    queryFn: () =>
      getSocialComplaints({
        limit: SOCIAL_COMPLAINTS_PAGE_SIZE,
        page,
        ...(source ? { source } : {}),
      }),
    queryKey: queryKeys.socialComplaints.list(source ?? "all", page),
    staleTime: 30_000,
  });

  const pagination = query.data?.pagination;

  return {
    complaints: query.data?.items,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isPending,
    pagination,
    refetch: query.refetch,
  };
}

export function useSyncSocialComplaints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (source: SocialComplaintSource) => syncSocialComplaints(source),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.socialComplaints.all,
      });
    },
  });
}
