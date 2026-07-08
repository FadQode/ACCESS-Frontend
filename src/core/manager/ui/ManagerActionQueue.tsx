"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Link2,
  LoaderCircle,
  Paperclip,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useActionRequestDetail } from "@/core/dashboard/hooks/use-action-request-detail";
import { useActionRequestDetails } from "@/core/dashboard/hooks/use-action-request-details";
import { useActionRequests } from "@/core/dashboard/hooks/use-action-requests";
import { useAgentPerformanceReport } from "@/core/dashboard/hooks/use-agent-performance-report";
import { useTakeAction } from "@/core/dashboard/hooks/use-take-action";
import type { ActionRequest } from "@/core/dashboard/model/types/action-request.types";
import { mapActionRequestToManagerCluster } from "@/core/manager/model/manager-action.mapper";
import type {
  ComplaintClusterStatus,
  ManagerActionCategory,
  ManagerActionCluster,
  ManagerActionReference,
  ManagerActionStatus,
} from "@/core/manager/model/manager-action.types";
import { useAttachReferenceToActionRequest } from "@/core/reference/hooks/use-attach-reference-to-action-request";
import { useDetachReferenceFromActionRequest } from "@/core/reference/hooks/use-detach-reference-from-action-request";
import { useReferenceFileUrl } from "@/core/reference/hooks/use-reference-file-url";
import { useReferences } from "@/core/reference/hooks/use-references";
import type { ReferenceItem } from "@/core/reference/model/types/reference.types";
import type { ActionRequestReferenceUsageType } from "@/core/reference/model/types/reference-attachment.types";
import {
  closeReferenceWindow,
  navigateReferenceWindow,
  openPendingReferenceWindow,
} from "@/core/reference/ui/open-reference-window";

const MANAGER_NAME = "Mgr. Dina";

type SortDirection = "asc" | "desc";
type ManagerActionSortKey = "cluster" | "category" | "status" | "raised";
type ManagerActionSortConfig = {
  key: ManagerActionSortKey;
  direction: SortDirection;
};
type ActionReferenceModalStyle = CSSProperties & {
  "--action-reference-modal-max-height": string;
  "--action-reference-modal-top": string;
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

const categoryLabel: Record<string, string> = {
  account: "Login / OTP / Akun",
  app_error: "Aplikasi Error / Lemot",
  app_update: "Update Aplikasi",
  app_issue: "Kendala Aplikasi",
  cancellation: "Pembatalan",
  delay: "Keterlambatan",
  facility: "Fasilitas",
  lost_item: "Barang Tertinggal",
  no_response_cs: "CS Tidak Merespons",
  other: "Lainnya",
  payment: "Pembayaran",
  queue_problem: "Antrian / Promo",
  refund: "Pengembalian Dana",
  refund_cancel: "Refund / Pembatalan",
  ticket_booking: "Tiket / Booking",
};

const categoryBadgeClass: Record<string, string> = {
  account: "bg-[#e9e4f4] text-[#5c4788]",
  app_error: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  app_update: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  app_issue: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
  delay: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  facility: "bg-[#e9e4f4] text-[#5c4788]",
  lost_item: "bg-[#eee8dc] text-[#765733]",
  no_response_cs: "bg-[#e9e4f4] text-[#5c4788]",
  other: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  payment: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
  queue_problem:
    "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  refund: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  refund_cancel: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
  ticket_booking: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
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

const usageTypeOptions: Array<{
  label: string;
  value: ActionRequestReferenceUsageType;
}> = [
  { label: "Dukungan Balasan Penutup", value: "closure_support" },
  { label: "Bukti / Konteks", value: "evidence" },
  { label: "Dasar Tindakan", value: "action_basis" },
  { label: "Dukungan Kebijakan", value: "policy_support" },
  { label: "Link Terkait", value: "related_link" },
  { label: "Catatan Internal", value: "internal_note" },
];

const usageTypeLabel = Object.fromEntries(
  usageTypeOptions.map((item) => [item.value, item.label]),
) as Record<ActionRequestReferenceUsageType, string>;

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
  const hydratedClusterIdRef = useRef<string | null>(null);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [detachReference, setDetachReference] =
    useState<ManagerActionReference | null>(null);
  const [formError, setFormError] = useState("");
  const [referenceFeedback, setReferenceFeedback] = useState("");
  const agentReportQuery = useAgentPerformanceReport({
    includeInactive: true,
    period: "90d",
  });
  const actionRequestsQuery = useActionRequests();
  const actionRequestDetailQuery = useActionRequestDetail(selectedClusterId);
  const actionRequestItems = actionRequestsQuery.data?.items ?? [];
  const actionRequestDetailQueries = useActionRequestDetails(
    actionRequestItems.map((actionRequest) => actionRequest.id),
    actionRequestItems.length > 0,
  );
  const takeActionMutation = useTakeAction();
  const attachReferenceMutation = useAttachReferenceToActionRequest(
    selectedClusterId ?? "",
  );
  const detachReferenceMutation = useDetachReferenceFromActionRequest(
    selectedClusterId ?? "",
  );
  const fileUrlMutation = useReferenceFileUrl();

  const agentNameById = useMemo(
    () =>
      new Map(
        (agentReportQuery.data?.agents ?? []).map((agent) => [
          agent.agentId,
          agent.agentName,
        ]),
      ),
    [agentReportQuery.data?.agents],
  );

  const actionRequestDetailsById = useMemo(
    () =>
      new Map(
        actionRequestDetailQueries
          .map((queryResult) => queryResult.data)
          .filter((actionRequest): actionRequest is ActionRequest =>
            Boolean(actionRequest),
          )
          .map((actionRequest) => [actionRequest.id, actionRequest]),
      ),
    [actionRequestDetailQueries],
  );

  const clusters = useMemo(
    () =>
      actionRequestItems.map((actionRequest) =>
        mapActionRequestToManagerCluster(
          actionRequestDetailsById.get(actionRequest.id) ?? actionRequest,
          agentNameById,
        ),
      ),
    [actionRequestDetailsById, actionRequestItems, agentNameById],
  );

  const detailedCluster = useMemo(
    () =>
      actionRequestDetailQuery.data
        ? mapActionRequestToManagerCluster(
            actionRequestDetailQuery.data,
            agentNameById,
          )
        : null,
    [actionRequestDetailQuery.data, agentNameById],
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
      hydratedClusterIdRef.current = null;
      return;
    }

    if (hydratedClusterIdRef.current === selectedClusterId) {
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
    hydratedClusterIdRef.current = selectedClusterId;
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
    hydratedClusterIdRef.current = cluster.id;
    setSelectedClusterId(cluster.id);
    setActionTaken(cluster.actionTaken);
    setClosureMessage(cluster.closureMessage);
    setFormError("");
    setReferenceFeedback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeCluster = () => {
    hydratedClusterIdRef.current = null;
    setSelectedClusterId(null);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAttachedReference = async (reference: ManagerActionReference) => {
    setReferenceFeedback("");

    if (reference.type === "link") {
      if (reference.url) {
        window.open(reference.url, "_blank", "noopener,noreferrer");
        return;
      }

      setReferenceFeedback("Link referensi tidak tersedia.");
      return;
    }

    if (reference.type === "file") {
      const pendingWindow = openPendingReferenceWindow();

      try {
        const fileUrl = await fileUrlMutation.mutateAsync(
          reference.referenceSourceId,
        );
        if (!navigateReferenceWindow(pendingWindow, fileUrl.signedUrl)) {
          setReferenceFeedback(
            "Browser memblokir tab referensi. Izinkan pop-up lalu coba lagi.",
          );
        }
      } catch {
        closeReferenceWindow(pendingWindow);
        setReferenceFeedback(
          "Gagal membuka file referensi. Silakan coba lagi.",
        );
      }
      return;
    }

    window.open(
      `/manager/references/${reference.referenceSourceId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const confirmDetachReference = async () => {
    if (!selectedClusterId || !detachReference) {
      return;
    }

    try {
      await detachReferenceMutation.mutateAsync(detachReference.id);
      setReferenceFeedback("Referensi berhasil dilepas dari action request.");
      setDetachReference(null);
    } catch (error) {
      setReferenceFeedback(
        error instanceof Error
          ? error.message
          : "Gagal melepas referensi. Silakan coba lagi.",
      );
    }
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
  const totalAgents = getUniqueAgentCount(clusters);

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
                formError={formError}
                isDetailLoading={actionRequestDetailQuery.isFetching}
                isOpeningReference={fileUrlMutation.isPending}
                isSubmitting={takeActionMutation.isPending}
                referenceFeedback={referenceFeedback}
                onActionTakenChange={setActionTaken}
                onBack={closeCluster}
                onClosureMessageChange={setClosureMessage}
                onCompleteAction={completeAction}
                onDetachReference={setDetachReference}
                onOpenAttachReferences={() => setAttachModalOpen(true)}
                onOpenReference={(reference) => {
                  void openAttachedReference(reference);
                }}
              />
            )}
          </div>
        </section>
      </div>
      {attachModalOpen && selectedCluster ? (
        <AttachReferenceModal
          actionRequestId={selectedCluster.id}
          attachedReferenceSourceIds={selectedCluster.references.map(
            (reference) => reference.referenceSourceId,
          )}
          isPending={attachReferenceMutation.isPending}
          onAttach={async (input) => {
            await attachReferenceMutation.mutateAsync(input);
            setReferenceFeedback("Referensi berhasil dilampirkan.");
            setAttachModalOpen(false);
          }}
          onClose={() => setAttachModalOpen(false)}
        />
      ) : null}

      {detachReference ? (
        <DetachReferenceDialog
          isPending={detachReferenceMutation.isPending}
          onClose={() => setDetachReference(null)}
          onConfirm={() => {
            void confirmDetachReference();
          }}
          reference={detachReference}
        />
      ) : null}
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
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--rail-border)] bg-[var(--background)]">
                  <TableHead
                    className="w-[42%]"
                    sortConfig={sortConfig}
                    sortKey="cluster"
                    onSortChange={onSortChange}
                  >
                    Cluster
                  </TableHead>
                  <TableHead
                    className="w-[16%]"
                    sortConfig={sortConfig}
                    sortKey="category"
                    onSortChange={onSortChange}
                  >
                    Kategori
                  </TableHead>
                  <TableHead
                    className="w-[16%]"
                    sortConfig={sortConfig}
                    sortKey="status"
                    onSortChange={onSortChange}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="w-[14%]"
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
                    <td className="px-4 py-12 text-center" colSpan={5}>
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
                    <td className="px-4 py-12 text-center" colSpan={5}>
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
                    <td className="px-4 py-12 text-center" colSpan={5}>
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
  formError,
  isDetailLoading,
  isOpeningReference,
  isSubmitting,
  referenceFeedback,
  onActionTakenChange,
  onBack,
  onClosureMessageChange,
  onCompleteAction,
  onDetachReference,
  onOpenAttachReferences,
  onOpenReference,
}: {
  actionTaken: string;
  closureMessage: string;
  cluster: ManagerActionCluster;
  formError: string;
  isDetailLoading: boolean;
  isOpeningReference: boolean;
  isSubmitting: boolean;
  referenceFeedback: string;
  onActionTakenChange: (value: string) => void;
  onBack: () => void;
  onClosureMessageChange: (value: string) => void;
  onCompleteAction: () => void;
  onDetachReference: (reference: ManagerActionReference) => void;
  onOpenAttachReferences: () => void;
  onOpenReference: (reference: ManagerActionReference) => void;
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
        <ContextPanel
          cluster={cluster}
          isOpeningReference={isOpeningReference}
          referenceFeedback={referenceFeedback}
          onDetachReference={onDetachReference}
          onOpenAttachReferences={onOpenAttachReferences}
          onOpenReference={onOpenReference}
        />
        {!isDone ? (
          <ManagerActionForm
            actionTaken={actionTaken}
            closureMessage={closureMessage}
            formError={formError}
            isSubmitting={isSubmitting}
            onActionTakenChange={onActionTakenChange}
            onClosureMessageChange={onClosureMessageChange}
            onCompleteAction={onCompleteAction}
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

function ContextPanel({
  cluster,
  isOpeningReference,
  referenceFeedback,
  onDetachReference,
  onOpenAttachReferences,
  onOpenReference,
}: {
  cluster: ManagerActionCluster;
  isOpeningReference: boolean;
  referenceFeedback: string;
  onDetachReference: (reference: ManagerActionReference) => void;
  onOpenAttachReferences: () => void;
  onOpenReference: (reference: ManagerActionReference) => void;
}) {
  const hasVisibleContextDetails = Boolean(
    cluster.affectedRoute || cluster.recommendedAction,
  );

  return (
    <Panel
      countLabel={`${cluster.references.length} referensi`}
      icon={<CheckCircle2 aria-hidden="true" size={15} />}
      title="Konteks dan referensi"
    >
      {hasVisibleContextDetails ? (
        <div className="space-y-3">
          {cluster.affectedRoute ? (
            <ContextRow
              label="Layanan terdampak"
              value={cluster.affectedRoute}
            />
          ) : null}
          {cluster.recommendedAction ? (
            <ContextRow
              label="Saran tindakan"
              value={cluster.recommendedAction}
            />
          ) : null}
        </div>
      ) : null}
      <div
        className={
          hasVisibleContextDetails
            ? "mt-4 border-t border-[var(--rail-border)] pt-4"
            : ""
        }
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--rail-ink)]">
              Referensi Terkait
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Referensi ini akan muncul di ticket agent melalui closure context.
            </p>
          </div>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--rail-ink)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)]"
            onClick={onOpenAttachReferences}
            type="button"
          >
            <Plus aria-hidden="true" size={14} />
            Tambah Referensi
          </button>
        </div>

        {referenceFeedback ? (
          <p className="mb-3 rounded-lg border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-3 py-2 text-xs text-[var(--signal-blue)]">
            {referenceFeedback}
          </p>
        ) : null}

        {cluster.references.length > 0 ? (
          <div className="grid gap-2">
            {cluster.references.map((reference) => (
              <ReferencePill
                isOpening={isOpeningReference}
                key={reference.id}
                reference={reference}
                onDetach={() => onDetachReference(reference)}
                onOpen={() => onOpenReference(reference)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4 text-xs leading-6 text-[var(--text-muted)]">
            Belum ada referensi yang dilampirkan manager.
          </div>
        )}
      </div>
    </Panel>
  );
}

function ManagerActionForm({
  actionTaken,
  closureMessage,
  formError,
  isSubmitting,
  onActionTakenChange,
  onClosureMessageChange,
  onCompleteAction,
}: {
  actionTaken: string;
  closureMessage: string;
  formError: string;
  isSubmitting: boolean;
  onActionTakenChange: (value: string) => void;
  onClosureMessageChange: (value: string) => void;
  onCompleteAction: () => void;
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

function AttachReferenceModal({
  actionRequestId,
  attachedReferenceSourceIds,
  isPending,
  onAttach,
  onClose,
}: {
  actionRequestId: string;
  attachedReferenceSourceIds: string[];
  isPending: boolean;
  onAttach: (input: {
    referenceSourceId: string;
    usageType: ActionRequestReferenceUsageType;
    note?: string | null;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedReferenceId, setSelectedReferenceId] = useState("");
  const [usageType, setUsageType] =
    useState<ActionRequestReferenceUsageType>("closure_support");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [modalStyle, setModalStyle] = useState<ActionReferenceModalStyle>({
    "--action-reference-modal-max-height": "calc(100dvh - 32px)",
    "--action-reference-modal-top": "16px",
  });

  useEffect(() => {
    const updateModalViewport = () => {
      const viewport = window.visualViewport;
      const visibleHeight = viewport?.height ?? window.innerHeight;

      setModalStyle({
        "--action-reference-modal-max-height": `${Math.max(
          120,
          visibleHeight - 32,
        )}px`,
        "--action-reference-modal-top": `${(visibleHeight - Math.min(visibleHeight - 32, 600)) / 2}px`,
      });
    };

    updateModalViewport();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", updateModalViewport);
    viewport?.addEventListener("scroll", updateModalViewport);
    window.addEventListener("resize", updateModalViewport);

    return () => {
      viewport?.removeEventListener("resize", updateModalViewport);
      viewport?.removeEventListener("scroll", updateModalViewport);
      window.removeEventListener("resize", updateModalViewport);
    };
  }, []);

  const referencesQuery = useReferences({
    limit: 20,
    page: 1,
    query,
    status: "active",
  });
  const attachedIds = useMemo(
    () => new Set(attachedReferenceSourceIds),
    [attachedReferenceSourceIds],
  );

  const attachSelectedReference = async () => {
    if (!selectedReferenceId) {
      setError("Pilih referensi terlebih dahulu.");
      return;
    }

    try {
      setError("");
      await onAttach({
        note: note.trim() || null,
        referenceSourceId: selectedReferenceId,
        usageType,
      });
    } catch (attachError) {
      setError(
        attachError instanceof Error
          ? attachError.message
          : "Gagal melampirkan referensi. Silakan coba lagi.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[rgba(19,35,31,0.42)] p-4 backdrop-blur-[2px]"
      style={modalStyle}
    >
      <section className="fixed left-1/2 top-[var(--action-reference-modal-top)] flex max-h-[var(--action-reference-modal-max-height)] w-[calc(100vw-32px)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-[var(--rail-border)] bg-white shadow-[var(--shadow-soft)]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--rail-border)] bg-white px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--signal-blue)]">
              {actionRequestId}
            </p>
            <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
              Tambah Referensi ke Action Request
            </h2>
          </div>
          <button
            aria-label="Tutup modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={14} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <label className="relative block">
            <span className="sr-only">Cari referensi</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              size={15}
            />
            <input
              className={cx(inputClassName, "h-10 pl-9 text-xs")}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari judul atau isi referensi"
              type="search"
              value={query}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Usage type
              </span>
              <select
                className={cx(inputClassName, "mt-1 h-10 text-xs")}
                onChange={(event) =>
                  setUsageType(
                    event.target.value as ActionRequestReferenceUsageType,
                  )
                }
                value={usageType}
              >
                {usageTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Catatan
              </span>
              <input
                className={cx(inputClassName, "mt-1 h-10 text-xs")}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Opsional"
                value={note}
              />
            </label>
          </div>

          <div className="min-h-36 flex-1 space-y-2 overflow-y-auto rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-2">
            {referencesQuery.isLoading ? (
              <div className="flex items-center gap-2 px-3 py-6 text-xs text-[var(--text-muted)]">
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={14}
                />
                Memuat referensi...
              </div>
            ) : (referencesQuery.data?.items ?? []).length > 0 ? (
              referencesQuery.data?.items.map((reference) => {
                const alreadyAttached = attachedIds.has(reference.id);
                const selected = selectedReferenceId === reference.id;

                return (
                  <ReferencePickerRow
                    alreadyAttached={alreadyAttached}
                    key={reference.id}
                    reference={reference}
                    selected={selected}
                    onSelect={() => setSelectedReferenceId(reference.id)}
                  />
                );
              })
            ) : (
              <p className="px-3 py-6 text-center text-xs text-[var(--text-muted)]">
                Semua referensi yang tersedia sudah dilampirkan atau tidak ada
                referensi aktif yang cocok.
              </p>
            )}
          </div>

          {error ? (
            <p className="rounded-lg border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] px-3 py-2 text-xs text-[var(--signal-red-dark)]">
              {error}
            </p>
          ) : null}

          <div className="shrink-0 flex justify-end gap-2 border-t border-[var(--rail-border)] pt-4">
            <button
              className="h-10 rounded-lg border border-[var(--rail-border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
              onClick={onClose}
              type="button"
            >
              Batal
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
              disabled={isPending}
              onClick={() => {
                void attachSelectedReference();
              }}
              type="button"
            >
              {isPending ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="animate-spin"
                    size={14}
                  />
                  Melampirkan...
                </>
              ) : (
                "Lampirkan"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReferencePickerRow({
  alreadyAttached,
  onSelect,
  reference,
  selected,
}: {
  alreadyAttached: boolean;
  onSelect: () => void;
  reference: ReferenceItem;
  selected: boolean;
}) {
  return (
    <button
      className={cx(
        "w-full rounded-lg border p-3 text-left transition",
        selected
          ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)]"
          : "border-[var(--rail-border)] bg-white",
        alreadyAttached
          ? "cursor-not-allowed opacity-60"
          : "hover:border-[var(--signal-blue)]",
      )}
      disabled={alreadyAttached}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--rail-ink)]">
            {reference.title}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {reference.displayType === "file"
              ? "File"
              : reference.displayType === "link"
                ? "Tautan"
                : "Teks"}
            {reference.tags.length > 0 ? ` - ${reference.tags.join(", ")}` : ""}
          </p>
        </div>
        {alreadyAttached ? (
          <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
            Sudah dilampirkan
          </span>
        ) : null}
      </div>
    </button>
  );
}

function DetachReferenceDialog({
  isPending,
  onClose,
  onConfirm,
  reference,
}: {
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reference: ManagerActionReference;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,35,31,0.42)] p-4 backdrop-blur-[2px]">
      <section className="w-full max-w-md rounded-xl border border-[var(--rail-border)] bg-white p-4 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
          Lepas referensi?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Referensi "{reference.title}" hanya akan dilepas dari action request,
          bukan dihapus dari library.
        </p>
        <div className="mt-5 flex justify-end gap-2 border-t border-[var(--rail-border)] pt-4">
          <button
            className="h-10 rounded-lg border border-[var(--rail-border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--signal-red)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-red-dark)] disabled:opacity-60"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={14}
                />
                Melepas...
              </>
            ) : (
              "Lepas"
            )}
          </button>
        </div>
      </section>
    </div>
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

function ReferencePill({
  isOpening,
  onDetach,
  onOpen,
  reference,
}: {
  isOpening: boolean;
  onDetach: () => void;
  onOpen: () => void;
  reference: ManagerActionReference;
}) {
  const Icon = reference.type === "file" ? Paperclip : Link2;

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--signal-blue-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
            <Icon aria-hidden="true" size={12} />
            {reference.type === "file"
              ? "File"
              : reference.type === "link"
                ? "Tautan"
                : "Teks"}
          </span>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
            {usageTypeLabel[
              reference.usageType as ActionRequestReferenceUsageType
            ] ?? reference.usageType}
          </span>
        </div>
        <p className="truncate text-sm font-semibold text-[var(--rail-ink)]">
          {reference.title}
        </p>
        {reference.note ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
            {reference.note}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--rail-border)] bg-white px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:opacity-50"
          disabled={isOpening}
          onClick={onOpen}
          type="button"
        >
          <ExternalLink aria-hidden="true" size={13} />
          Lihat
        </button>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--signal-red-soft)] bg-white px-3 text-xs font-semibold text-[var(--signal-red-dark)] transition hover:bg-[var(--signal-red-soft)]"
          onClick={onDetach}
          type="button"
        >
          <Trash2 aria-hidden="true" size={13} />
          Lepas
        </button>
      </div>
    </article>
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

function getUniqueAgentCount(clusters: ManagerActionCluster[]) {
  const agentNames = new Set<string>();

  for (const cluster of clusters) {
    for (const agentName of getAgentNames(cluster)) {
      const normalizedAgentName = agentName.trim();

      if (normalizedAgentName && normalizedAgentName !== "Unassigned agent") {
        agentNames.add(normalizedAgentName);
      }
    }
  }

  return agentNames.size;
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
