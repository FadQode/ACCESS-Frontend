"use client";

import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  RefreshCcw,
  Search,
  UserRound,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useComplaintDetail } from "@/core/dashboard/hooks/use-complaint-detail";
import { useComplaints } from "@/core/dashboard/hooks/use-complaints";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import type {
  Complaint,
  ComplaintFilters,
} from "@/core/dashboard/model/types/complaint.types";

type ComplaintStatusFilter =
  | "all"
  | "closed"
  | "resolved"
  | "submitted"
  | "waiting_action";

const statusFilters: Array<{
  label: string;
  value: ComplaintStatusFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Waiting", value: "waiting_action" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

const categoryFilters = [
  { label: "All categories", value: "" },
  { label: "Delay", value: "delay" },
  { label: "Refund", value: "refund" },
  { label: "Cancellation", value: "cancellation" },
  { label: "Lost item", value: "lost_item" },
  { label: "Facility", value: "facility" },
  { label: "Payment", value: "payment" },
  { label: "Account", value: "account" },
  { label: "App error", value: "app_error" },
  { label: "Other", value: "other" },
];

const sourceLabel: Record<string, string> = {
  app_store: "App Store",
  facebook: "Facebook",
  google_play: "Google Play",
  instagram: "Instagram",
  other: "Other",
  twitter: "Twitter",
  web_form: "Web Form",
};

const categoryLabel: Record<string, string> = {
  account: "Account",
  app_error: "App Error",
  cancellation: "Cancellation",
  delay: "Delay",
  facility: "Facility",
  lost_item: "Lost Item",
  other: "Other",
  payment: "Payment",
  refund: "Refund",
};

export function ComplaintQueue() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ComplaintStatusFilter>("all");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null,
  );

  const filters = useMemo<ComplaintFilters>(
    () => ({
      category,
      limit: 12,
      page,
      search,
      status: status === "all" ? "" : status,
    }),
    [category, page, search, status],
  );
  const complaintsQuery = useComplaints(filters);
  const complaintDetailQuery = useComplaintDetail(selectedComplaintId ?? "");
  const complaints = complaintsQuery.data?.items ?? [];
  const pagination = complaintsQuery.data?.pagination;
  const selectedComplaint =
    complaintDetailQuery.data ??
    complaints.find((complaint) => complaint.id === selectedComplaintId) ??
    null;

  const statusCounts = useMemo(
    () => ({
      all: pagination?.total ?? complaints.length,
      closed: complaints.filter((complaint) => complaint.status === "closed")
        .length,
      resolved: complaints.filter(
        (complaint) => complaint.status === "resolved",
      ).length,
      submitted: complaints.filter(
        (complaint) => complaint.status === "submitted",
      ).length,
      waiting_action: complaints.filter(
        (complaint) => complaint.status === "waiting_action",
      ).length,
    }),
    [complaints, pagination?.total],
  );

  const openComplaint = (complaint: Complaint) => {
    setSelectedComplaintId(complaint.id);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const closeComplaint = () => {
    setSelectedComplaintId(null);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Loaded", value: complaints.length.toString() },
            { label: "Waiting", value: statusCounts.waiting_action.toString() },
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

          <div className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
            {!selectedComplaint ? (
              <ComplaintTableView
                category={category}
                complaints={complaints}
                errorMessage={getErrorMessage(complaintsQuery.error)}
                isError={complaintsQuery.isError}
                isLoading={complaintsQuery.isLoading}
                page={page}
                paginationTotalPages={pagination?.totalPages ?? 1}
                search={search}
                status={status}
                statusCounts={statusCounts}
                onCategoryChange={(value) => {
                  setPage(1);
                  setCategory(value);
                }}
                onNextPage={() => setPage((current) => current + 1)}
                onOpenComplaint={openComplaint}
                onPreviousPage={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                onRetry={() => {
                  void complaintsQuery.refetch();
                }}
                onSearchChange={(value) => {
                  setPage(1);
                  setSearch(value);
                }}
                onStatusChange={(value) => {
                  setPage(1);
                  setStatus(value);
                }}
              />
            ) : (
              <ComplaintDetailView
                complaint={selectedComplaint}
                isLoadingDetail={complaintDetailQuery.isFetching}
                onBack={closeComplaint}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ComplaintTableView({
  category,
  complaints,
  errorMessage,
  isError,
  isLoading,
  page,
  paginationTotalPages,
  search,
  status,
  statusCounts,
  onCategoryChange,
  onNextPage,
  onOpenComplaint,
  onPreviousPage,
  onRetry,
  onSearchChange,
  onStatusChange,
}: {
  category: string;
  complaints: Complaint[];
  errorMessage: string;
  isError: boolean;
  isLoading: boolean;
  page: number;
  paginationTotalPages: number;
  search: string;
  status: ComplaintStatusFilter;
  statusCounts: Record<ComplaintStatusFilter, number>;
  onCategoryChange: (category: string) => void;
  onNextPage: () => void;
  onOpenComplaint: (complaint: Complaint) => void;
  onPreviousPage: () => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: ComplaintStatusFilter) => void;
}) {
  return (
    <div className="page-transition">
      <header className="border-b border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--rail-ink)]">
              Complaints
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Customer reports across public and private channels
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.waiting_action}
              </span>{" "}
              waiting &middot;{" "}
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.resolved}
              </span>{" "}
              resolved
            </div>
            <label className="relative block w-full sm:w-[260px]">
              <span className="sr-only">Search complaints</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                size={15}
              />
              <input
                className="h-10 w-full rounded-md border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-xs text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search complaints..."
                type="search"
                value={search}
              />
            </label>
          </div>
        </div>
      </header>

      <div className="bg-[var(--surface-muted)] p-4 sm:p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Total complaints" value={statusCounts.all} />
          <MetricCard
            label="Waiting action"
            value={statusCounts.waiting_action}
          />
          <MetricCard
            label="Resolved / closed"
            value={statusCounts.resolved + statusCounts.closed}
          />
        </div>

        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.map((item) => (
              <button
                className={cx(
                  "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium transition",
                  status === item.value
                    ? "border-[#1a3f6f] bg-[#1a3f6f] text-white"
                    : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]",
                )}
                key={item.value}
                onClick={() => onStatusChange(item.value)}
                type="button"
              >
                {item.label}
                <span className="ml-2 opacity-70">
                  {statusCounts[item.value]}
                </span>
              </button>
            ))}
          </div>

          <select
            className="h-9 rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-medium text-[var(--text-muted)] outline-none transition focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
            onChange={(event) => onCategoryChange(event.target.value)}
            value={category}
          >
            {categoryFilters.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--rail-border)] bg-[var(--background)]">
                  <TableHead className="w-[30%]">Complaint</TableHead>
                  <TableHead className="w-[12%]">Source</TableHead>
                  <TableHead className="w-[13%]">Category</TableHead>
                  <TableHead className="w-[14%]">Status</TableHead>
                  <TableHead className="w-[17%]">Handler</TableHead>
                  <TableHead className="w-[10%]">Submitted</TableHead>
                  <TableHead className="w-[4%] text-right">Action</TableHead>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableState
                    description="Fetching complaints from backend."
                    title="Loading complaints..."
                  />
                ) : isError ? (
                  <TableState
                    action={
                      <button
                        className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                        onClick={onRetry}
                        type="button"
                      >
                        <RefreshCcw aria-hidden="true" size={14} />
                        Try again
                      </button>
                    }
                    description={errorMessage}
                    title="Failed to load complaints"
                  />
                ) : complaints.length > 0 ? (
                  complaints.map((complaint) => (
                    <tr
                      className="cursor-pointer border-b border-[var(--rail-border)] transition last:border-b-0 hover:bg-[#f8fbff]"
                      key={complaint.id}
                      onClick={() => onOpenComplaint(complaint)}
                    >
                      <TableCell>
                        <p className="font-medium text-[var(--rail-ink)]">
                          {complaint.referenceNo}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[var(--text-muted)]">
                          {complaint.complaintText}
                        </p>
                      </TableCell>
                      <TableCell>{formatSource(complaint)}</TableCell>
                      <TableCell>
                        <CategoryBadge category={complaint.category} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status} />
                      </TableCell>
                      <TableCell>
                        <HandlerSummary complaint={complaint} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatRelativeDate(
                            complaint.submittedAt ?? complaint.createdAt,
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-[var(--text-tertiary)]">
                        <ChevronRight
                          aria-hidden="true"
                          className="ml-auto"
                          size={17}
                        />
                      </TableCell>
                    </tr>
                  ))
                ) : (
                  <TableState
                    description="Try changing the filter or search keyword."
                    title="No complaints found"
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={onPreviousPage}
            type="button"
          >
            Previous
          </button>
          <span className="text-xs text-[var(--text-muted)]">
            Page {page} of {paginationTotalPages}
          </span>
          <button
            className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= paginationTotalPages || complaints.length === 0}
            onClick={onNextPage}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ComplaintDetailView({
  complaint,
  isLoadingDetail,
  onBack,
}: {
  complaint: Complaint;
  isLoadingDetail: boolean;
  onBack: () => void;
}) {
  const sessions = complaint.quickResponseSessions ?? [];
  const latestSession = sessions[0];

  return (
    <div className="page-transition bg-[var(--surface-muted)] p-4 sm:p-5">
      <div className="mb-4">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={15} />
          Back to complaints
        </button>
      </div>

      <section className="mb-5 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--rail-ink)] sm:text-xl">
              {complaint.referenceNo}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <CategoryBadge category={complaint.category} />
              <span className="text-xs text-[var(--text-muted)]">
                {formatSource(complaint)} &middot; submitted{" "}
                {formatRelativeDate(complaint.submittedAt)}
              </span>
            </div>
          </div>
          <Badge>{complaint.trackingToken ?? "No tracking token"}</Badge>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {isLoadingDetail ? (
            <p className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3 text-xs text-[var(--text-muted)]">
              Loading complaint detail...
            </p>
          ) : null}

          <Panel title="Complaint text">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--rail-ink)]">
              {complaint.complaintText}
            </p>
          </Panel>

          <Panel
            countLabel={`${sessions.length} sessions`}
            title="Handling status"
          >
            {sessions.length > 0 ? (
              <div className="divide-y divide-[var(--rail-border)] overflow-hidden rounded-lg border border-[var(--rail-border)]">
                {sessions.map((session) => (
                  <article
                    className="bg-[var(--surface-panel)] p-3"
                    key={session.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--rail-ink)]">
                          {session.agent?.name ?? "Agent"}
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                          {formatOutcome(session.outcome)} &middot;{" "}
                          {formatAbsoluteDate(session.createdAt)}
                        </p>
                      </div>
                      <Badge>{session.responseTarget ?? "response"}</Badge>
                    </div>
                    {session.finalResponse ? (
                      <p className="mt-3 line-clamp-3 text-xs leading-6 text-[var(--text-muted)]">
                        "{session.finalResponse}"
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4">
                <p className="text-sm font-semibold text-[var(--rail-ink)]">
                  No handling session yet
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  Quick response sessions will appear after an agent handles
                  this complaint.
                </p>
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel
            countLabel={latestSession?.agent?.name ?? "No handler"}
            title="Reporter and source"
          >
            <div className="space-y-3">
              <DetailRow
                label="Complainer"
                value={complaint.complainerName ?? "Anonymous"}
              />
              <DetailRow
                label="Contact"
                value={complaint.complainerContact ?? "-"}
              />
              <DetailRow label="Source" value={formatSource(complaint)} />
              <DetailRow label="Handle" value={complaint.sourceHandle ?? "-"} />
              {complaint.sourceUrl ? (
                <a
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                  href={complaint.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" size={14} />
                  Open source
                </a>
              ) : null}
            </div>
          </Panel>

          <Panel title="Timeline">
            <TimelineItem
              label="Complaint submitted"
              time={formatAbsoluteDate(
                complaint.submittedAt ?? complaint.createdAt,
              )}
            />
            {sessions.map((session) => (
              <TimelineItem
                key={session.id}
                label={`${session.agent?.name ?? "Agent"} handled response`}
                time={formatAbsoluteDate(session.createdAt)}
              />
            ))}
            {complaint.resolvedAt ? (
              <TimelineItem
                label="Complaint resolved"
                time={formatAbsoluteDate(complaint.resolvedAt)}
                tone="success"
              />
            ) : null}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function HandlerSummary({ complaint }: { complaint: Complaint }) {
  const latestSession = complaint.quickResponseSessions?.[0];

  if (latestSession?.agent) {
    return (
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[var(--rail-ink)]">
          {latestSession.agent.name}
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          {latestSession.agent.email}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-[var(--text-tertiary)]">
        <UserRound aria-hidden="true" size={14} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[var(--rail-ink)]">
          {complaint.status === "submitted" ? "Belum ditugaskan" : "Agent"}
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          Open detail for handler
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const copy: Record<string, string> = {
    closed: "Closed",
    resolved: "Resolved",
    submitted: "Submitted",
    waiting_action: "Waiting Action",
  };
  const classes: Record<string, string> = {
    closed: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    resolved: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    submitted: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    waiting_action:
      "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  };

  return (
    <Badge className={classes[status] ?? classes.submitted}>
      {copy[status] ?? status}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const classes: Record<string, string> = {
    account: "bg-[#e9e4f4] text-[#5c4788]",
    app_error: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    delay: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    facility: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    lost_item: "bg-[#eee8dc] text-[#765733]",
    other: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    payment: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    refund: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  };

  return (
    <Badge className={classes[category] ?? classes.other}>
      {categoryLabel[category] ?? category}
    </Badge>
  );
}

function Panel({
  children,
  countLabel,
  title,
}: {
  children: ReactNode;
  countLabel?: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]">
      <div className="flex items-center gap-2 border-b border-[var(--rail-border)] bg-[var(--background)] px-4 py-3">
        <h3 className="flex-1 text-xs font-medium text-[var(--rail-ink)]">
          {title}
        </h3>
        {countLabel ? (
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {countLabel}
          </span>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function TableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cx(
        "px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--text-tertiary)]",
        className,
      )}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cx(
        "px-4 py-3 align-middle text-sm text-[var(--rail-ink)]",
        className,
      )}
    >
      {children}
    </td>
  );
}

function TableState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <tr>
      <td className="px-4 py-12 text-center" colSpan={7}>
        <p className="text-sm font-semibold text-[var(--rail-ink)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
        {action}
      </td>
    </tr>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-[var(--rail-border)] pb-3 last:border-b-0 last:pb-0">
      <p className="w-24 shrink-0 text-xs text-[var(--text-muted)]">{label}</p>
      <p className="flex-1 text-right text-xs font-medium text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  label,
  time,
  tone = "neutral",
}: {
  label: string;
  time: string;
  tone?: "neutral" | "success";
}) {
  return (
    <div className="flex gap-3 border-l border-[var(--rail-border)] pb-4 pl-3 last:pb-0">
      <span
        className={cx(
          "-ml-[17px] mt-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface-panel)]",
          tone === "success"
            ? "bg-[var(--signal-green)]"
            : "bg-[var(--signal-blue)]",
        )}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--rail-ink)]">{label}</p>
        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">{time}</p>
      </div>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[10px] font-medium",
        className ?? "bg-[var(--background)] text-[var(--text-muted)]",
      )}
    >
      {children}
    </span>
  );
}

function formatSource(complaint: Complaint) {
  const source = sourceLabel[complaint.source] ?? complaint.source;

  return complaint.sourceHandle
    ? `${source} · ${complaint.sourceHandle}`
    : source;
}

function formatOutcome(outcome?: string) {
  const copy: Record<string, string> = {
    copy_only: "Copied only",
    escalated: "Escalated",
    saved_ticket: "Saved ticket",
    sent_hea_action: "HEA and action requested",
    sent_resolved: "Resolved response",
  };

  return outcome ? (copy[outcome] ?? outcome) : "Response session";
}

function formatAbsoluteDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelativeDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return "Baru saja";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} menit lalu`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays} hari lalu`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Failed to load complaints.";
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
