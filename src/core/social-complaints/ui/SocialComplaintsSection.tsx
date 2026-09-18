"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCcw,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { formatRelativeTimeId } from "@/core/dashboard/model/utils/date.utils";
import { useSocialComplaints } from "../hooks/use-social-complaints";
import type {
  SocialComplaint,
  SocialComplaintSource,
} from "../model/social-complaints.types";

export type UseSocialComplaintPayload = {
  id: string;
  content: string;
  /** Complainer display name, used to prefill the Quick Response handle. */
  author: string;
  /** Link to the original post/comment, when the source provides one. */
  sourceUrl: string | null;
};

export type SocialComplaintsSectionProps = {
  onUseComplaint?: (payload: UseSocialComplaintPayload) => void;
};

type SourceFilter = SocialComplaintSource | "all";

const sourceFilters: { label: string; value: SourceFilter }[] = [
  { label: "Semua", value: "all" },
  { label: "Google Play", value: "google_play" },
  { label: "Facebook", value: "facebook" },
  { label: "X", value: "x" },
];

const sourceLabels: Record<SocialComplaintSource, string> = {
  facebook: "Facebook",
  google_play: "Google Play",
  x: "X",
};

export function SocialComplaintsSection({
  onUseComplaint,
}: SocialComplaintsSectionProps) {
  const [source, setSource] = useState<SourceFilter>("all");
  const [page, setPage] = useState(1);

  const { complaints, isError, isFetching, isLoading, pagination, refetch } =
    useSocialComplaints({
      page,
      ...(source === "all" ? {} : { source }),
    });

  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const hasComplaints = Boolean(complaints && complaints.length > 0);

  const handleSourceChange = (nextSource: SourceFilter) => {
    setSource(nextSource);
    setPage(1);
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
          Keluhan Media Sosial
        </h3>
        <SocialBadge>
          {isLoading || !complaints
            ? "Memuat…"
            : `${pagination?.total ?? complaints.length} item`}
        </SocialBadge>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {sourceFilters.map((filter) => {
          const isActive = filter.value === source;

          return (
            <button
              aria-pressed={isActive}
              className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[10px] font-semibold transition ${
                isActive
                  ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
                  : "border-[var(--rail-border)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              }`}
              key={filter.value}
              onClick={() => handleSourceChange(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {isError ? (
        <div className="rounded-lg border border-dashed border-[var(--signal-red-soft)] bg-[var(--surface-panel)] p-4 text-center">
          <p className="text-xs leading-5 text-[var(--text-muted)]">
            Keluhan media sosial gagal dimuat.
          </p>
          <button
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[var(--rail-border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--signal-blue)] transition hover:border-[var(--signal-blue)]"
            onClick={() => void refetch()}
            type="button"
          >
            <RefreshCcw aria-hidden="true" size={12} />
            Coba lagi
          </button>
        </div>
      ) : isLoading || !complaints ? (
        <div className="space-y-3">
          <div className="skeleton-sheen h-28 rounded-lg" />
          <div className="skeleton-sheen h-28 rounded-lg" />
          <div className="skeleton-sheen h-28 rounded-lg" />
        </div>
      ) : !hasComplaints ? (
        <p className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--surface-panel)] p-3 text-xs leading-5 text-[var(--text-muted)]">
          {source === "all"
            ? "Belum ada keluhan dari media sosial."
            : `Tidak ada keluhan dari ${sourceLabels[source]}.`}
        </p>
      ) : (
        <div
          className={`space-y-3 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {complaints.map((complaint) => (
            <SocialComplaintCard
              complaint={complaint}
              key={complaint.id}
              onUseComplaint={onUseComplaint}
            />
          ))}
        </div>
      )}

      {!isError && complaints && hasComplaints && totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-2.5 text-[11px] font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--rail-border)] disabled:hover:text-[var(--text-muted)]"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={13} />
            Previous
          </button>
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">
            {pagination?.page ?? page} / {totalPages}
          </span>
          <button
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-2.5 text-[11px] font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--rail-border)] disabled:hover:text-[var(--text-muted)]"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => Math.min(current + 1, totalPages))
            }
            type="button"
          >
            Next
            <ChevronRight aria-hidden="true" size={13} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function SocialComplaintCard({
  complaint,
  onUseComplaint,
}: {
  complaint: SocialComplaint;
  onUseComplaint?: (payload: UseSocialComplaintPayload) => void;
}) {
  return (
    <article className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs font-semibold text-[var(--rail-ink)]">
          {complaint.author}
        </span>
        <SocialBadge>{sourceLabels[complaint.source]}</SocialBadge>
      </div>

      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--text-muted)]">
        “{complaint.content}”
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
          {formatRelativeTimeId(complaint.publishedAt)}
        </span>
        {complaint.sourceUrl ? (
          <a
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--signal-blue)] transition hover:underline"
            href={complaint.sourceUrl}
            rel="noreferrer noopener"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" size={11} />
            Sumber
          </a>
        ) : null}
      </div>

      <button
        className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] px-2.5 text-[11px] font-semibold text-[var(--signal-blue)] transition hover:bg-[var(--signal-blue)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!onUseComplaint}
        onClick={() =>
          onUseComplaint?.({
            author: complaint.author,
            content: complaint.content,
            id: complaint.id,
            sourceUrl: complaint.sourceUrl,
          })
        }
        type="button"
      >
        Gunakan Keluhan
      </button>
    </article>
  );
}

function SocialBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
      {children}
    </span>
  );
}
