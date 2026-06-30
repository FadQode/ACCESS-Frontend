"use client";

import {
  ArrowLeft,
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

const statusFilters: Array<{
  value: "all" | ManagerActionStatus;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const categoryLabel: Record<ManagerActionCategory, string> = {
  app_issue: "App Issue",
  cancellation: "Cancellation",
  delay: "Delay",
  facility: "Facility",
  lost_item: "Lost Item",
  other: "Other",
  payment: "Payment",
  refund: "Refund",
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
  done: "Done",
  in_progress: "In Progress",
  pending: "Pending",
};

const statusBadgeClass: Record<ManagerActionStatus, string> = {
  done: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  in_progress: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  pending: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
};

export function ManagerActionQueue() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null,
  );
  const [filter, setFilter] = useState<"all" | ManagerActionStatus>("all");
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

    return clusters.filter((cluster) => {
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
  }, [clusters, filter, searchQuery]);

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
        "Please fill action taken and closure message before submitting.",
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
          : "Failed to record action. Please try again.",
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
            { label: "Pending", value: statusCounts.pending.toString() },
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
                statusCounts={statusCounts}
                totalAgents={totalAgents}
                totalComplaints={totalComplaints}
                onFilterChange={setFilter}
                onOpenCluster={openCluster}
                onRetry={() => {
                  void actionRequestsQuery.refetch();
                }}
                onSearchChange={setSearchQuery}
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
  statusCounts,
  totalAgents,
  totalComplaints,
  onFilterChange,
  onOpenCluster,
  onRetry,
  onSearchChange,
}: {
  clusters: ManagerActionCluster[];
  errorMessage: string;
  filter: "all" | ManagerActionStatus;
  isLoading: boolean;
  searchQuery: string;
  statusCounts: Record<"all" | ManagerActionStatus, number>;
  totalAgents: number;
  totalComplaints: number;
  onFilterChange: (filter: "all" | ManagerActionStatus) => void;
  onOpenCluster: (cluster: ManagerActionCluster) => void;
  onRetry: () => void;
  onSearchChange: (query: string) => void;
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
              Clusters awaiting manager action
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.pending}
              </span>{" "}
              pending &middot;{" "}
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.in_progress}
              </span>{" "}
              in progress &middot;{" "}
              <span className="font-semibold text-[var(--rail-ink)]">
                {statusCounts.done}
              </span>{" "}
              done
            </div>
            <label className="relative block w-full sm:w-[240px]">
              <span className="sr-only">Search clusters</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                size={15}
              />
              <input
                className="h-10 w-full rounded-md border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-xs text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search clusters..."
                type="search"
                value={searchQuery}
              />
            </label>
          </div>
        </div>
      </header>

      <div className="bg-[var(--surface-muted)] p-4 sm:p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Complaint clusters" value={statusCounts.all} />
          <MetricCard label="Affected complaints" value={totalComplaints} />
          <MetricCard label="Agents waiting" value={totalAgents} />
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
                  <TableHead className="w-[34%]">Cluster</TableHead>
                  <TableHead className="w-[14%]">Category</TableHead>
                  <TableHead className="w-[18%]">Agents</TableHead>
                  <TableHead className="w-[14%]">Status</TableHead>
                  <TableHead className="w-[12%]">Raised</TableHead>
                  <TableHead className="w-[8%] text-right">Action</TableHead>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={6}>
                      <p className="text-sm font-semibold text-[var(--rail-ink)]">
                        Loading action requests...
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Fetching manager action clusters from backend.
                      </p>
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={6}>
                      <p className="text-sm font-semibold text-[var(--rail-ink)]">
                        Failed to load action requests.
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {errorMessage}
                      </p>
                      <button
                        className="mt-4 rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                        onClick={onRetry}
                        type="button"
                      >
                        Try again
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
                        No action requests yet
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Manager action requests will appear here when agents
                        request follow-up actions.
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
          Back to action queue
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
                {cluster.complaintCount} complaints &middot;{" "}
                {cluster.agentCount} agents waiting &middot; raised{" "}
                {cluster.relativeTime}
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
            Loading linked complaints and ticket context...
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
      countLabel={`${cluster.agentCount} agents`}
      icon={<FileText aria-hidden="true" size={15} />}
      title="Complaints in this cluster"
    >
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        All sent HEA, waiting manager action and agent closure.
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
      countLabel="Retrieved by AI"
      icon={<CheckCircle2 aria-hidden="true" size={15} />}
      title="Context and references"
    >
      <div className="space-y-3">
        <ContextRow label="Detected issue" value={cluster.detectedIssue} />
        {cluster.affectedRoute ? (
          <ContextRow label="Affected service" value={cluster.affectedRoute} />
        ) : null}
        <ContextRow label="Policy applies" value={cluster.policyApplies} />
        {cluster.similarPastCase ? (
          <ContextRow
            label="Similar past case"
            value={cluster.similarPastCase}
          />
        ) : null}
        {cluster.recommendedAction ? (
          <ContextRow
            label="Recommended action"
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
      countLabel="Sent to agent ticket inboxes"
      icon={<CheckCircle2 aria-hidden="true" size={15} />}
      title="Complete action and notify agents"
      variant="action"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-muted)]">
            What action did you take?
          </span>
          <textarea
            className={cx(inputClassName, "mt-2 min-h-[92px] resize-none py-3")}
            onChange={(event) => onActionTakenChange(event.target.value)}
            value={actionTaken}
          />
          <span className="mt-1 block text-[11px] text-[var(--text-tertiary)]">
            Internal record - agents will see this in their ticket.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Closure message - sent to each agent, forwarded to their complainer
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
            Attachments and references
          </p>
          <div className="flex flex-col gap-2 lg:flex-row">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]">
              <Paperclip aria-hidden="true" size={15} />
              Attach document
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
                <span className="sr-only">Add reference URL</span>
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
                  placeholder="Add reference URL"
                  value={referenceInput}
                />
              </label>
              <button
                className="h-10 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                onClick={onAddReference}
                type="button"
              >
                Add
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
            Related agents will receive this in their ticket inboxes.
          </p>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1a3f6f] px-5 text-sm font-medium text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onCompleteAction}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={16} />
            {isSubmitting
              ? "Recording action..."
              : "Complete action & notify agents"}
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
        Manager action completed - agents notified
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
        All related agents have received the closure message in their ticket
        inbox. Each can now send it to their respective complainer and close the
        ticket.
      </p>
      <div className="mt-3 inline-flex rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-4 py-1 text-xs font-medium text-[var(--signal-blue)]">
        {cluster.displayId} &middot; completed by{" "}
        {cluster.completedBy ?? MANAGER_NAME} &middot;{" "}
        {cluster.completedAt ?? "just now"}
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

function AgentSummary({ cluster }: { cluster: ManagerActionCluster }) {
  const agentNames = getAgentNames(cluster);

  if (cluster.agentCount === 0) {
    return (
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[var(--rail-ink)]">
          Open detail
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
          Agents load in detail
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
        {cluster.agentCount} agents waiting
      </p>
    </div>
  );
}

function formatComplaintCount(cluster: ManagerActionCluster) {
  if (cluster.complaintCount === 0) {
    return "Open detail for linked complaints";
  }

  return `${cluster.complaintCount} complaints in this cluster`;
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
    closed: "Closed by agent",
    hea_sent: "HEA sent",
    ready_to_notify: "Ready to notify",
    waiting_manager: "HEA sent - waiting manager action",
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

const inputClassName =
  "w-full rounded-md border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
