"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  FileText,
  Link2,
  Paperclip,
  Search,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useActionRequestDetail } from "@/core/dashboard/hooks/use-action-request-detail";
import { useActionRequests } from "@/core/dashboard/hooks/use-action-requests";
import { useTakeAction } from "@/core/dashboard/hooks/use-take-action";
import { mapActionRequestToManagerCluster } from "@/core/manager/model/manager-action.mapper";
import type {
  ComplaintClusterStatus,
  ManagerActionCategory,
  ManagerActionCluster,
  ManagerActionReference,
  ManagerActionStatus,
} from "@/core/manager/model/manager-action.types";

const MANAGER_NAME = "Mgr. Dina";

type SortDirection = "asc" | "desc";
type ManagerActionSortKey =
  | "cluster"
  | "category"
  | "agents"
  | "status"
  | "raised";
type ManagerActionSortConfig = {
  key: ManagerActionSortKey;
  direction: SortDirection;
};

const statusFilters: Array<{
  value: "all" | ManagerActionStatus;
  label: string;
}> = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "in_progress", label: "Diproses" },
  { value: "done", label: "Selesai" },
];

const categoryLabel: Record<ManagerActionCategory, string> = {
  app_issue: "Kendala Aplikasi",
  cancellation: "Pembatalan",
  delay: "Keterlambatan",
  facility: "Fasilitas",
  lost_item: "Barang Tertinggal",
  other: "Lainnya",
  payment: "Pembayaran",
  refund: "Pengembalian Dana",
};

const categoryBadgeClass: Record<ManagerActionCategory, string> = {
  app_issue: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
  delay: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  facility: "bg-[#e9e4f4] text-[#5c4788]",
  lost_item: "bg-[#eee8dc] text-[#765733]",
  other: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  payment: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
  refund: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
};

const statusLabel: Record<ManagerActionStatus, string> = {
  done: "Selesai",
  in_progress: "Diproses",
  pending: "Menunggu",
};

const statusBadgeClass: Record<ManagerActionStatus, string> = {
  done: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  in_progress: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  pending: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
};

const managerStatusRank: Record<ManagerActionStatus, number> = {
  pending: 0,
  in_progress: 1,
  done: 2,
};

export function ManagerActionQueue() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null,
  );
  const [filter, setFilter] = useState<"all" | ManagerActionStatus>("all");
  const [sortConfig, setSortConfig] = useState<ManagerActionSortConfig>({
    direction: "asc",
    key: "status",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [closureMessage, setClosureMessage] = useState("");
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const [referenceInput, setReferenceInput] = useState("");
  const [draftReferences, setDraftReferences] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const actionRequestsQuery = useActionRequests();
  const actionRequestDetailQuery = useActionRequestDetail(selectedClusterId);
  const takeActionMutation = useTakeAction();

  const clusters = useMemo(
    () =>
      (actionRequestsQuery.data?.items ?? []).map((actionRequest) =>
        mapActionRequestToManagerCluster(actionRequest),
      ),
    [actionRequestsQuery.data],
  );

  const detailedCluster = useMemo(
    () =>
      actionRequestDetailQuery.data
        ? mapActionRequestToManagerCluster(actionRequestDetailQuery.data)
        : null,
    [actionRequestDetailQuery.data],
  );

  const selectedCluster = useMemo(
    () =>
      detailedCluster ??
      clusters.find((cluster) => cluster.id === selectedClusterId) ??
      null,
    [clusters, detailedCluster, selectedClusterId],
  );

  useEffect(() => {
    if (!selectedClusterId) {
      return;
    }

    const cluster =
      detailedCluster ??
      clusters.find((item) => item.id === selectedClusterId) ??
      null;

    if (!cluster) {
      return;
    }

    setActionTaken(cluster.actionTaken);
    setClosureMessage(cluster.closureMessage);
  }, [clusters, detailedCluster, selectedClusterId]);

  const visibleClusters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filteredClusters = clusters.filter((cluster) => {
      const matchesFilter = filter === "all" || cluster.status === filter;
      const searchableText = [
        cluster.displayId,
        cluster.title,
        cluster.category,
        cluster.detectedIssue,
        cluster.policyApplies,
        cluster.affectedRoute,
        ...cluster.complaints.map((complaint) =>
          [
            complaint.customerName,
            complaint.agentName,
            complaint.linkedTicketId,
            complaint.complaintText,
          ].join(" "),
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });

    return sortManagerClusters(filteredClusters, sortConfig);
  }, [clusters, filter, searchQuery, sortConfig]);

  const changeSort = (key: ManagerActionSortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          direction: current.direction === "asc" ? "desc" : "asc",
          key,
        };
      }

      return {
        direction: key === "raised" ? "desc" : "asc",
        key,
      };
    });
  };

  const statusCounts = useMemo(() => {
    return {
      all: clusters.length,
      done: clusters.filter((cluster) => cluster.status === "done").length,
      in_progress: clusters.filter(
        (cluster) => cluster.status === "in_progress",
      ).length,
      pending: clusters.filter((cluster) => cluster.status === "pending")
        .length,
    };
  }, [clusters]);

  const openCluster = (cluster: ManagerActionCluster) => {
    setSelectedClusterId(cluster.id);
    setActionTaken(cluster.actionTaken);
    setClosureMessage(cluster.closureMessage);
    setDocumentNames([]);
    setDraftReferences([]);
    setReferenceInput("");
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeCluster = () => {
    setSelectedClusterId(null);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addReference = () => {
    const trimmed = referenceInput.trim();

    if (!trimmed) {
      return;
    }

    setDraftReferences((current) => [...current, trimmed]);
    setReferenceInput("");
  };

  const completeAction = async () => {
    if (!selectedCluster) {
      return;
    }

    if (actionTaken.trim().length < 5 || closureMessage.trim().length < 5) {
      setFormError(
        "Isi tindakan yang dilakukan dan pesan penutup sebelum mengirim.",
      );
      return;
    }

    try {
      await takeActionMutation.mutateAsync({
        id: selectedCluster.id,
        input: {
          actionTaken: actionTaken.trim(),
          closureMessage: closureMessage.trim(),
        },
      });
      setFormError("");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal mencatat tindakan. Coba lagi.",
      );
    }
  };

  const totalComplaints = clusters.reduce(
    (sum, cluster) => sum + cluster.complaintCount,
    0,
  );
  const totalAgents = clusters.reduce(
    (sum, cluster) => sum + cluster.agentCount,
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="manager"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Menunggu", value: statusCounts.pending.toString() },
            { label: "Clusters", value: clusters.length.toString() },
            { label: "Complaints", value: totalComplaints.toString() },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
          />

          <div className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
            {!selectedCluster ? (
              <QueueTableView
                clusters={visibleClusters}
                errorMessage={
                  actionRequestsQuery.isError
                    ? actionRequestsQuery.error.message
                    : ""
                }
                filter={filter}
                isLoading={actionRequestsQuery.isLoading}
                searchQuery={searchQuery}
                sortConfig={sortConfig}
                statusCounts={statusCounts}
                totalAgents={totalAgents}
                totalComplaints={totalComplaints}
                onFilterChange={setFilter}
                onOpenCluster={openCluster}
                onRetry={() => {
                  void actionRequestsQuery.refetch();
                }}
                onSearchChange={setSearchQuery}
                onSortChange={changeSort}
              />
            ) : (
              <ClusterDetailView
                actionTaken={actionTaken}
                closureMessage={closureMessage}
                cluster={selectedCluster}
                documentNames={documentNames}
                draftReferences={draftReferences}
                formError={formError}
                isDetailLoading={actionRequestDetailQuery.isFetching}
                isSubmitting={takeActionMutation.isPending}
                referenceInput={referenceInput}
                onActionTakenChange={setActionTaken}
                onAddReference={addReference}
                onBack={closeCluster}
                onClosureMessageChange={setClosureMessage}
                onCompleteAction={completeAction}
                onDocumentNamesChange={setDocumentNames}
                onReferenceInputChange={setReferenceInput}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function QueueTableView({
  clusters,
  errorMessage,
  filter,
  isLoading,
  searchQuery,
  sortConfig,
  statusCounts,
  totalAgents,
  totalComplaints,
  onFilterChange,
  onOpenCluster,
  onRetry,
  onSearchChange,
  onSortChange,
}: {
  clusters: ManagerActionCluster[];
  errorMessage: string;
  filter: "all" | ManagerActionStatus;
  isLoading: boolean;
  searchQuery: string;
  sortConfig: ManagerActionSortConfig;
  statusCounts: Record<"all" | ManagerActionStatus, number>;
  totalAgents: number;
  totalComplaints: number;
  onFilterChange: (filter: "all" | ManagerActionStatus) => void;
  onOpenCluster: (cluster: ManagerActionCluster) => void;
  onRetry: () => void;
  onSearchChange: (query: string) => void;
  onSortChange: (key: ManagerActionSortKey) => void;
}) {
  return (
    <div className="page-transition">
      <header className="border-b border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--rail-ink)]">
              Action Queue
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Cluster yang menunggu tindakan manager
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.pending}
              </span>{" "}
              menunggu &middot;{" "}
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.in_progress}
              </span>{" "}
              diproses &middot;{" "}
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.done}
              </span>{" "}
              selesai
            </div>
            <label className="relative block w-full sm:w-[240px]">
              <span className="sr-only">Cari cluster</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                size={15}
              />
              <input
                className="h-10 w-full rounded-md border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-xs text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Cari cluster..."
                type="search"
                value={searchQuery}
              />
            </label>
          </div>
        </div>
      </header>

      <div className="bg-[var(--surface-muted)] p-4 sm:p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Cluster complaint" value={statusCounts.all} />
          <MetricCard label="Complaint terdampak" value={totalComplaints} />
          <MetricCard label="Agent menunggu" value={totalAgents} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {statusFilters.map((statusFilter) => (
            <button
              className={cx(
                "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium transition",
                filter === statusFilter.value
                  ? "border-[#1a3f6f] bg-[#1a3f6f] text-white"
                  : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]",
              )}
              key={statusFilter.value}
              onClick={() => onFilterChange(statusFilter.value)}
              type="button"
            >
              {statusFilter.label}
              <span className="ml-2 opacity-70">
                {statusCounts[statusFilter.value]}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--rail-border)] bg-[var(--background)]">
                  <TableHead
                    className="w-[34%]"
                    sortConfig={sortConfig}
                    sortKey="cluster"
                    onSortChange={onSortChange}
                  >
                    Cluster
                  </TableHead>
                  <TableHead
                    className="w-[14%]"
                    sortConfig={sortConfig}
                    sortKey="category"
                    onSortChange={onSortChange}
                  >
                    Kategori
                  </TableHead>
                  <TableHead
                    className="w-[18%]"
                    sortConfig={sortConfig}
                    sortKey="agents"
                    onSortChange={onSortChange}
                  >
                    Agent
                  </TableHead>
                  <TableHead
                    className="w-[14%]"
                    sortConfig={sortConfig}
                    sortKey="status"
                    onSortChange={onSortChange}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="w-[12%]"
                    sortConfig={sortConfig}
                    sortKey="raised"
                    onSortChange={onSortChange}
                  >
                    Masuk
                  </TableHead>
                  <TableHead className="w-[8%] text-right">Aksi</TableHead>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={6}>
                      <p className="text-sm font-semibold text-[var(--rail-ink)]">
                        Memuat action requests...
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Mengambil cluster tindakan manager dari backend.
                      </p>
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={6}>
                      <p className="text-sm font-semibold text-[var(--rail-ink)]">
                        Action requests gagal dimuat.
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {errorMessage}
                      </p>
                      <button
                        className="mt-4 rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                        onClick={onRetry}
                        type="button"
                      >
                        Coba lagi
                      </button>
                    </td>
                  </tr>
                ) : clusters.length > 0 ? (
                  clusters.map((cluster) => (
                    <tr
                      className={cx(
                        "cursor-pointer border-b border-[var(--rail-border)] transition last:border-b-0 hover:bg-[#f8fbff]",
                        cluster.status === "done" ? "opacity-70" : "",
                      )}
                      key={cluster.id}
                      onClick={() => onOpenCluster(cluster)}
                    >
                      <TableCell>
                        <p className="font-medium text-[var(--rail-ink)]">
                          {cluster.title}
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                          {formatComplaintCount(cluster)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={cluster.category} />
                      </TableCell>
                      <TableCell>
                        <AgentSummary cluster={cluster} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={cluster.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--text-muted)]">
                          {cluster.relativeTime}
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
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={6}>
                      <p className="text-sm font-semibold text-[var(--rail-ink)]">
                        Belum ada action request
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Action request akan muncul di sini setelah agent meminta
                        tindak lanjut.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClusterDetailView({
  actionTaken,
  closureMessage,
  cluster,
  documentNames,
  draftReferences,
  formError,
  isDetailLoading,
  isSubmitting,
  referenceInput,
  onActionTakenChange,
  onAddReference,
  onBack,
  onClosureMessageChange,
  onCompleteAction,
  onDocumentNamesChange,
  onReferenceInputChange,
}: {
  actionTaken: string;
  closureMessage: string;
  cluster: ManagerActionCluster;
  documentNames: string[];
  draftReferences: string[];
  formError: string;
  isDetailLoading: boolean;
  isSubmitting: boolean;
  referenceInput: string;
  onActionTakenChange: (value: string) => void;
  onAddReference: () => void;
  onBack: () => void;
  onClosureMessageChange: (value: string) => void;
  onCompleteAction: () => void;
  onDocumentNamesChange: (names: string[]) => void;
  onReferenceInputChange: (value: string) => void;
}) {
  const isDone = cluster.status === "done";
  const agentNames = getAgentNames(cluster);

  return (
    <div className="page-transition bg-[var(--surface-muted)] p-4 sm:p-5">
      <div className="mb-4">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={15} />
          Kembali ke Action Queue
        </button>
      </div>

      <section className="mb-5 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--rail-ink)] sm:text-xl">
              {cluster.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category={cluster.category} />
              <StatusBadge status={cluster.status} />
              <span className="text-xs text-[var(--text-muted)]">
                {cluster.complaintCount} complaint &middot; {cluster.agentCount}{" "}
                agent menunggu &middot; masuk {cluster.relativeTime}
              </span>
            </div>
          </div>
          <Badge>{cluster.displayId}</Badge>
        </div>
      </section>

      {isDone ? (
        <CompletionState agentNames={agentNames} cluster={cluster} />
      ) : null}

      <div className="mx-auto max-w-5xl space-y-5">
        {isDetailLoading ? (
          <p className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3 text-xs text-[var(--text-muted)]">
            Memuat complaint terkait dan konteks ticket...
          </p>
        ) : null}
        <ComplaintsPanel cluster={cluster} />
        <ContextPanel cluster={cluster} />
        {!isDone ? (
          <ManagerActionForm
            actionTaken={actionTaken}
            closureMessage={closureMessage}
            documentNames={documentNames}
            draftReferences={draftReferences}
            formError={formError}
            isSubmitting={isSubmitting}
            referenceInput={referenceInput}
            onActionTakenChange={onActionTakenChange}
            onAddReference={onAddReference}
            onClosureMessageChange={onClosureMessageChange}
            onCompleteAction={onCompleteAction}
            onDocumentNamesChange={onDocumentNamesChange}
            onReferenceInputChange={onReferenceInputChange}
          />
        ) : null}
      </div>
    </div>
  );
}

function ComplaintsPanel({ cluster }: { cluster: ManagerActionCluster }) {
  return (
    <Panel
      countLabel={`${cluster.agentCount} agent`}
      icon={<FileText aria-hidden="true" size={15} />}
      title="Complaints dalam cluster ini"
    >
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        Semua sudah mengirim HEA, menunggu tindakan manager dan penutupan oleh
        agent.
      </p>
      <div className="divide-y divide-[var(--rail-border)] overflow-hidden rounded-lg border border-[var(--rail-border)]">
        {cluster.complaints.map((complaint) => (
          <article
            className="flex gap-3 bg-[var(--surface-panel)] p-3"
            key={complaint.id}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-[var(--rail-ink)]">
                  {complaint.customerName}
                </p>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  {complaint.sourceLabel}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {complaint.agentName}
                </span>
                <Badge>{complaint.linkedTicketId}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                "{complaint.complaintText}"
              </p>
              <div className="mt-2">
                <ComplaintStatusBadge status={complaint.status} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ContextPanel({ cluster }: { cluster: ManagerActionCluster }) {
  return (
    <Panel
      countLabel="Diambil oleh AI"
      icon={<CheckCircle2 aria-hidden="true" size={15} />}
      title="Konteks dan referensi"
    >
      <div className="space-y-3">
        <ContextRow label="Isu terdeteksi" value={cluster.detectedIssue} />
        {cluster.affectedRoute ? (
          <ContextRow label="Layanan terdampak" value={cluster.affectedRoute} />
        ) : null}
        <ContextRow label="Kebijakan terkait" value={cluster.policyApplies} />
        {cluster.similarPastCase ? (
          <ContextRow label="Kasus serupa" value={cluster.similarPastCase} />
        ) : null}
        {cluster.recommendedAction ? (
          <ContextRow
            label="Saran tindakan"
            value={cluster.recommendedAction}
          />
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {cluster.references.map((reference) => (
          <ReferencePill key={reference.id} reference={reference} />
        ))}
      </div>
    </Panel>
  );
}

function ManagerActionForm({
  actionTaken,
  closureMessage,
  documentNames,
  draftReferences,
  formError,
  isSubmitting,
  referenceInput,
  onActionTakenChange,
  onAddReference,
  onClosureMessageChange,
  onCompleteAction,
  onDocumentNamesChange,
  onReferenceInputChange,
}: {
  actionTaken: string;
  closureMessage: string;
  documentNames: string[];
  draftReferences: string[];
  formError: string;
  isSubmitting: boolean;
  referenceInput: string;
  onActionTakenChange: (value: string) => void;
  onAddReference: () => void;
  onClosureMessageChange: (value: string) => void;
  onCompleteAction: () => void;
  onDocumentNamesChange: (names: string[]) => void;
  onReferenceInputChange: (value: string) => void;
}) {
  return (
    <Panel
      countLabel="Dikirim ke inbox ticket agent"
      icon={<CheckCircle2 aria-hidden="true" size={15} />}
      title="Selesaikan tindakan dan beri tahu agent"
      variant="action"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Tindakan apa yang dilakukan?
          </span>
          <textarea
            className={cx(inputClassName, "mt-2 min-h-[92px] resize-none py-3")}
            onChange={(event) => onActionTakenChange(event.target.value)}
            value={actionTaken}
          />
          <span className="mt-1 block text-[11px] text-[var(--text-tertiary)]">
            Catatan internal - agent akan melihatnya di ticket mereka.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Closure message - dikirim ke setiap agent untuk diteruskan ke
            pelapor
          </span>
          <textarea
            className={cx(
              inputClassName,
              "mt-2 min-h-[132px] resize-none py-3",
            )}
            onChange={(event) => onClosureMessageChange(event.target.value)}
            value={closureMessage}
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-[var(--text-muted)]">
            Lampiran dan referensi
          </p>
          <div className="flex flex-col gap-2 lg:flex-row">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]">
              <Paperclip aria-hidden="true" size={15} />
              Lampirkan dokumen
              <input
                className="sr-only"
                multiple
                onChange={(event) =>
                  onDocumentNamesChange(
                    Array.from(event.target.files ?? []).map(
                      (file) => file.name,
                    ),
                  )
                }
                type="file"
              />
            </label>

            <div className="flex min-w-0 flex-1 gap-2">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Tambah URL referensi</span>
                <Link2
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                  size={15}
                />
                <input
                  className={cx(inputClassName, "h-10 pl-9 text-xs")}
                  onChange={(event) =>
                    onReferenceInputChange(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onAddReference();
                    }
                  }}
                  placeholder="Tambah URL referensi"
                  value={referenceInput}
                />
              </label>
              <button
                className="h-10 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                onClick={onAddReference}
                type="button"
              >
                Tambah
              </button>
            </div>
          </div>

          {documentNames.length > 0 || draftReferences.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {documentNames.map((name) => (
                <Badge key={name}>{name}</Badge>
              ))}
              {draftReferences.map((reference) => (
                <Badge key={reference}>{reference}</Badge>
              ))}
            </div>
          ) : null}
        </div>

        {formError ? (
          <p className="rounded-md border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] px-3 py-2 text-xs font-medium text-[var(--signal-red-dark)]">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[var(--rail-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Agent terkait akan menerima ini di inbox ticket mereka.
          </p>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1a3f6f] px-5 text-sm font-medium text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onCompleteAction}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={16} />
            {isSubmitting
              ? "Mencatat tindakan..."
              : "Selesaikan tindakan & beri tahu agent"}
          </button>
        </div>
      </div>
    </Panel>
  );
}

function CompletionState({
  agentNames,
  cluster,
}: {
  agentNames: string[];
  cluster: ManagerActionCluster;
}) {
  return (
    <section className="mb-5 rounded-lg border border-[var(--signal-green-soft)] bg-[var(--surface-panel)] p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]">
        <CheckCircle2 aria-hidden="true" size={28} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--rail-ink)]">
        Tindakan manager selesai - agent sudah diberi tahu
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
        Semua agent terkait sudah menerima closure message di inbox ticket.
        Masing-masing agent sekarang bisa mengirimkannya ke pelapor dan menutup
        ticket.
      </p>
      <div className="mt-3 inline-flex rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-4 py-1 text-xs font-medium text-[var(--signal-blue)]">
        {cluster.displayId} &middot; diselesaikan oleh{" "}
        {cluster.completedBy ?? MANAGER_NAME} &middot;{" "}
        {cluster.completedAt ?? "baru saja"}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {agentNames.map((agentName) => (
          <Badge key={agentName}>{agentName}</Badge>
        ))}
      </div>
    </section>
  );
}

function Panel({
  children,
  countLabel,
  icon,
  title,
  variant = "default",
}: {
  children: ReactNode;
  countLabel?: string;
  icon?: ReactNode;
  title: string;
  variant?: "default" | "action";
}) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-lg border bg-[var(--surface-panel)]",
        variant === "action"
          ? "border-[#1a3f6f]"
          : "border-[var(--rail-border)]",
      )}
    >
      <div
        className={cx(
          "flex items-center gap-2 border-b px-4 py-3",
          variant === "action"
            ? "border-[var(--signal-blue-soft)] bg-[#f0f5fb]"
            : "border-[var(--rail-border)] bg-[var(--background)]",
        )}
      >
        {icon ? (
          <span className="text-[var(--signal-blue)]">{icon}</span>
        ) : null}
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
  sortConfig,
  sortKey,
  onSortChange,
}: {
  children: ReactNode;
  className?: string;
  sortConfig?: ManagerActionSortConfig;
  sortKey?: ManagerActionSortKey;
  onSortChange?: (key: ManagerActionSortKey) => void;
}) {
  const isSortable = Boolean(sortKey && sortConfig && onSortChange);
  const isActive = isSortable && sortConfig?.key === sortKey;

  return (
    <th
      aria-sort={
        isActive
          ? sortConfig?.direction === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
      className={cx(
        "px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--text-tertiary)]",
        className,
      )}
    >
      {isSortable && sortKey ? (
        <button
          className={cx(
            "inline-flex items-center gap-1.5 text-left transition hover:text-[var(--signal-blue)]",
            isActive ? "text-[var(--signal-blue)]" : "",
          )}
          onClick={() => onSortChange?.(sortKey)}
          type="button"
        >
          <span>{children}</span>
          <SortIcon
            active={Boolean(isActive)}
            direction={sortConfig?.direction}
          />
        </button>
      ) : (
        children
      )}
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

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction?: SortDirection;
}) {
  if (!active) {
    return <ArrowUpDown aria-hidden="true" size={12} />;
  }

  return direction === "asc" ? (
    <ArrowUp aria-hidden="true" size={12} />
  ) : (
    <ArrowDown aria-hidden="true" size={12} />
  );
}

function AgentSummary({ cluster }: { cluster: ManagerActionCluster }) {
  const agentNames = getAgentNames(cluster);

  if (cluster.agentCount === 0) {
    return (
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[var(--rail-ink)]">
          Buka detail
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          Agent akan dimuat di detail
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-medium text-[var(--rail-ink)]">
        {agentNames.slice(0, 2).join(", ")}
        {agentNames.length > 2 ? ` +${agentNames.length - 2}` : ""}
      </p>
      <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
        {cluster.agentCount} agent menunggu
      </p>
    </div>
  );
}

function formatComplaintCount(cluster: ManagerActionCluster) {
  if (cluster.complaintCount === 0) {
    return "Buka detail untuk complaint terkait";
  }

  return `${cluster.complaintCount} complaint dalam cluster ini`;
}

function StatusBadge({ status }: { status: ManagerActionStatus }) {
  return (
    <Badge className={statusBadgeClass[status]}>{statusLabel[status]}</Badge>
  );
}

function CategoryBadge({ category }: { category: ManagerActionCategory }) {
  return (
    <Badge className={categoryBadgeClass[category]}>
      {categoryLabel[category]}
    </Badge>
  );
}

function ComplaintStatusBadge({ status }: { status: ComplaintClusterStatus }) {
  const copy: Record<ComplaintClusterStatus, string> = {
    closed: "Ditutup oleh agent",
    hea_sent: "HEA terkirim",
    ready_to_notify: "Siap dikabari",
    waiting_manager: "HEA terkirim - menunggu tindakan manager",
  };

  return (
    <span className="inline-flex rounded-full bg-[#e6f1fb] px-2 py-1 text-[10px] font-medium text-[#0c447c]">
      {copy[status]}
    </span>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-[var(--rail-border)] pb-3 last:border-b-0 last:pb-0">
      <p className="w-36 shrink-0 text-xs text-[var(--text-muted)]">{label}</p>
      <p className="flex-1 text-right text-xs font-medium text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function ReferencePill({ reference }: { reference: ManagerActionReference }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-[#b5d4f4] bg-[#e6f1fb] px-3 py-1 text-[11px] font-medium text-[#0c447c]">
      {reference.title}
    </span>
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

function getAgentNames(cluster: ManagerActionCluster) {
  return Array.from(
    new Set(cluster.complaints.map((complaint) => complaint.agentName)),
  );
}

function sortManagerClusters(
  clusters: ManagerActionCluster[],
  sortConfig: ManagerActionSortConfig,
) {
  const direction = sortConfig.direction === "asc" ? 1 : -1;

  return [...clusters].sort((first, second) => {
    const result = compareManagerSortValues(
      getManagerClusterSortValue(first, sortConfig.key),
      getManagerClusterSortValue(second, sortConfig.key),
    );

    if (result !== 0) {
      return result * direction;
    }

    return (
      compareManagerSortValues(
        toTime(second.raisedAt),
        toTime(first.raisedAt),
      ) || first.displayId.localeCompare(second.displayId)
    );
  });
}

function getManagerClusterSortValue(
  cluster: ManagerActionCluster,
  key: ManagerActionSortKey,
): string | number {
  if (key === "cluster") {
    return `${cluster.displayId} ${cluster.title}`;
  }

  if (key === "category") {
    return categoryLabel[cluster.category];
  }

  if (key === "agents") {
    return cluster.agentCount;
  }

  if (key === "status") {
    return managerStatusRank[cluster.status];
  }

  return toTime(cluster.raisedAt);
}

function compareManagerSortValues(
  first: string | number,
  second: string | number,
) {
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }

  return String(first).localeCompare(String(second), "id", {
    numeric: true,
    sensitivity: "base",
  });
}

function toTime(value?: string | null) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

const inputClassName =
  "w-full rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
