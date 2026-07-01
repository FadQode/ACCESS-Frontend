"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ApiStateBoundary } from "@/core/components/feedback";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useComplaints } from "@/core/dashboard/hooks/use-complaints";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import type { ComplaintFilters } from "@/core/dashboard/model/types/complaint.types";
import { ComplaintStatusBadge } from "./complaint-status-badge";

const SKELETON_ROWS = [
  "complaint-skeleton-1",
  "complaint-skeleton-2",
  "complaint-skeleton-3",
  "complaint-skeleton-4",
];

export function ComplaintList() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo<ComplaintFilters>(
    () => ({
      category,
      limit: 10,
      page,
      search,
      status,
    }),
    [category, page, search, status],
  );
  const complaintsQuery = useComplaints(filters);
  const complaints = complaintsQuery.data?.items ?? [];
  const pagination = complaintsQuery.data?.pagination;

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Loaded", value: complaints.length.toString() },
            { label: "Page", value: String(pagination?.page ?? page) },
            { label: "Total", value: String(pagination?.total ?? 0) },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Agen layanan"
            userName="User"
          />

          <section className="overflow-hidden rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
            <header className="border-b border-[var(--rail-border)] bg-white p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                Backend complaints
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                Complaint List
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Read-only complaint data from the backend. Mutation flows stay
                disabled for this phase.
              </p>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                <label className="relative">
                  <span className="sr-only">Search complaints</span>
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                    size={16}
                  />
                  <input
                    className="h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                    onChange={(event) => {
                      setPage(1);
                      setSearch(event.target.value);
                    }}
                    placeholder="Search complaint text"
                    type="search"
                    value={search}
                  />
                </label>
                <select
                  className="h-11 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                  onChange={(event) => {
                    setPage(1);
                    setStatus(event.target.value);
                  }}
                  value={status}
                >
                  <option value="">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="waiting_action">Waiting action</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <input
                  className="h-11 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                  onChange={(event) => {
                    setPage(1);
                    setCategory(event.target.value);
                  }}
                  placeholder="Category"
                  value={category}
                />
              </div>
            </header>

            <div className="p-4 sm:p-5">
              <ApiStateBoundary
                emptyFallback={
                  <div className="rounded-xl border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-6 text-center">
                    <p className="text-sm font-semibold text-[var(--rail-ink)]">
                      No complaints found.
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      Try changing the filter or search keyword.
                    </p>
                  </div>
                }
                errorMessage={getErrorMessage(complaintsQuery.error)}
                isEmpty={complaints.length === 0}
                isError={complaintsQuery.isError}
                isLoading={complaintsQuery.isLoading}
                loadingFallback={<ComplaintListSkeleton />}
                onRetry={() => {
                  void complaintsQuery.refetch();
                }}
              >
                <div className="grid gap-3">
                  {complaints.map((complaint) => (
                    <Link
                      className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-4 transition hover:border-[var(--signal-blue)] hover:bg-white"
                      href={`/agent/complaints/${complaint.id}`}
                      key={complaint.id}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--rail-ink)]">
                            {complaint.referenceNo}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {complaint.source} · {complaint.category}
                          </p>
                        </div>
                        <ComplaintStatusBadge status={complaint.status} />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--rail-ink)]">
                        {complaint.complaintText}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--rail-border)] pt-4">
                  <button
                    className="h-10 rounded-lg border border-[var(--rail-border)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    type="button"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-[var(--text-muted)]">
                    Page {pagination?.page ?? page} of{" "}
                    {pagination?.totalPages ?? 1}
                  </span>
                  <button
                    className="h-10 rounded-lg border border-[var(--rail-border)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={
                      pagination
                        ? pagination.page >= pagination.totalPages
                        : complaints.length === 0
                    }
                    onClick={() => setPage((current) => current + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </ApiStateBoundary>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function ComplaintListSkeleton() {
  return (
    <div className="grid gap-3">
      {SKELETON_ROWS.map((item) => (
        <div
          className="h-28 animate-pulse rounded-lg border border-[var(--rail-border)] bg-[var(--background)]"
          key={item}
        />
      ))}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Failed to load complaints.";
}
