"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Filter,
  Link2,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import type {
  ManagerActionCategory,
  ManagerActionCluster,
  ManagerActionStatus,
} from "@/core/manager/model/manager-action.types";
import {
  mockManagerActionClusters,
} from "@/core/manager/model/manager-action.mock";

const MANAGER = {
  id: "manager-001",
  name: "Mgr. Dina",
};

const statusFilters: { value: "all" | ManagerActionStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const categoryLabel: Record<ManagerActionCategory, string> = {
  delay: "Delay",
  refund: "Refund",
  cancellation: "Cancellation",
  facility: "Facility",
  lost_item: "Lost Item",
  payment: "Payment",
  app_issue: "App Issue",
  other: "Other",
};

const categoryBadgeClass: Record<ManagerActionCategory, string> = {
  delay: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  refund: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  cancellation: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
  facility: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
  lost_item: "bg-[#ede4f7] text-[#6b3fa0]",
  payment: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  app_issue: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  other: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
};

const statusLabel: Record<ManagerActionStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const statusBadgeClass: Record<ManagerActionStatus, string> = {
  pending: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  in_progress: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  done: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
};

const sourceLabel: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  web_form: "Web Form",
  google_play: "Google Play",
  app_store: "App Store",
  other: "Other",
};

export function ManagerActionQueue() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clusters, setClusters] = useState<ManagerActionCluster[]>(
    structuredClone(mockManagerActionClusters),
  );
  const [selectedClusterId, setSelectedClusterId] = useState(
    mockManagerActionClusters[0]?.id ?? "",
  );
  const [filter, setFilter] = useState<"all" | ManagerActionStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [closureMessage, setClosureMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionAlert, setCompletionAlert] = useState("");

  const selectedCluster = clusters.find(
    (c) => c.id === selectedClusterId,
  ) ?? clusters[0];

  useEffect(() => {
    const selected = clusters.find((c) => c.id === selectedClusterId);
    setActionTaken(selected?.actionTaken ?? "");
    setClosureMessage(selected?.closureMessage ?? "");
    setIsCompleted(selected?.status === "done");
    setCompletionAlert("");
  }, [selectedClusterId, clusters]);

  const pendingCount = clusters.filter(
    (c) => c.status !== "done",
  ).length;

  const visibleClusters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return clusters.filter((c) => {
      const matchesFilter = filter === "all" || c.status === filter;
      const matchesSearch =
        !query ||
        [c.title, c.displayId, c.detectedIssue, c.affectedRoute, c.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query) ||
        c.complaints.some(
          (comp) =>
            comp.customerName.toLowerCase().includes(query) ||
            comp.agentName.toLowerCase().includes(query) ||
            comp.linkedTicketId.toLowerCase().includes(query) ||
            comp.complaintText.toLowerCase().includes(query),
        );
      return matchesFilter && matchesSearch;
    });
  }, [clusters, filter, searchQuery]);

  const handleCompleteAction = () => {
    setClusters((currentClusters) =>
      currentClusters.map((cluster) =>
        cluster.id === selectedClusterId
          ? {
              ...cluster,
              status: "done" as ManagerActionStatus,
              actionTaken,
              closureMessage,
              completedBy: MANAGER.name,
              completedAt: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              complaints: cluster.complaints.map((comp) => ({
                ...comp,
                status: "ready_to_notify" as const,
              })),
            }
          : cluster,
      ),
    );
    setIsCompleted(true);
    setCompletionAlert(
      "Manager action completed — agents notified",
    );
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="manager"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          stats={[
            { label: "Pending", value: pendingCount.toString() },
            { label: "Clusters", value: clusters.length.toString() },
            {
              label: "Complaints",
              value: clusters
                .reduce((sum, c) => sum + c.complaintCount, 0)
                .toString(),
            },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((open) => !open)}
            roleLabel="Manager operations"
            userName={MANAGER.name}
          />

          <div className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
            <header className="border-b border-[var(--rail-border)] bg-[linear-gradient(135deg,#fbfcf7_0%,#edf4ef_48%,#f7e8bd_100%)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                    Manager operations
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)] sm:text-3xl">
                    Manager Action Queue
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    Grouped complaint clusters that require manager action.
                    Complete one action for the whole cluster and notify all
                    related agents.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[430px]">
                  <MetricPill
                    label="Clusters pending"
                    value={pendingCount}
                  />
                  <MetricPill
                    label="Complaints"
                    value={clusters.reduce(
                      (sum, c) => sum + c.complaintCount,
                      0,
                    )}
                  />
                  <MetricPill
                    label="Agents waiting"
                    value={clusters.reduce(
                      (sum, c) => sum + c.agentCount,
                      0,
                    )}
                  />
                </div>
              </div>
            </header>

            <div className="grid min-h-[760px] grid-cols-1 xl:grid-cols-[390px_minmax(0,1fr)]">
              <ActionQueueSidebar
                clusters={visibleClusters}
                filter={filter}
                searchQuery={searchQuery}
                selectedClusterId={selectedCluster?.id ?? ""}
                onFilterChange={setFilter}
                onSearchChange={setSearchQuery}
                onSelectCluster={(id) => {
                  setSelectedClusterId(id);
                  setCompletionAlert("");
                }}
              />

              <section className="min-w-0 bg-[linear-gradient(180deg,#f8faf5_0%,#edf2ef_100%)] p-4 sm:p-5">
                {selectedCluster ? (
                  <>
                    <ClusterHeader cluster={selectedCluster} />

                    {completionAlert ? (
                      <div className="mt-4 rounded-lg border border-[var(--signal-green)] bg-[var(--signal-green-soft)] px-4 py-3 text-sm font-medium text-[var(--signal-green-dark)]">
                        {completionAlert}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="space-y-4">
                        <ComplaintsInCluster cluster={selectedCluster} />
                        <ContextAndReferences cluster={selectedCluster} />

                        {!isCompleted ? (
                          <ManagerActionWorkspace
                            actionTaken={actionTaken}
                            closureMessage={closureMessage}
                            cluster={selectedCluster}
                            onActionTakenChange={setActionTaken}
                            onClosureMessageChange={setClosureMessage}
                            onSubmit={handleCompleteAction}
                          />
                        ) : (
                          <CompletionState cluster={selectedCluster} />
                        )}
                      </div>

                      <aside className="space-y-4">
                        <PreviewSection
                          actionTaken={
                            selectedCluster.status === "done"
                              ? selectedCluster.actionTaken
                              : actionTaken
                          }
                          closureMessage={
                            selectedCluster.status === "done"
                              ? selectedCluster.closureMessage
                              : closureMessage
                          }
                          references={selectedCluster.references}
                        />
                      </aside>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[520px] items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-[var(--rail-ink)]">
                        No cluster selected
                      </h2>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Select a cluster from the queue to review and take
                        action.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ActionQueueSidebar({
  clusters,
  filter,
  searchQuery,
  selectedClusterId,
  onFilterChange,
  onSearchChange,
  onSelectCluster,
}: {
  clusters: ManagerActionCluster[];
  filter: "all" | ManagerActionStatus;
  searchQuery: string;
  selectedClusterId: string;
  onFilterChange: (f: "all" | ManagerActionStatus) => void;
  onSearchChange: (q: string) => void;
  onSelectCluster: (id: string) => void;
}) {
  return (
    <aside className="border-b border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 xl:border-b-0 xl:border-r">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--rail-ink)]">
            Action Queue
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {clusters.length} cluster
            {clusters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--signal-blue)]">
          <ClipboardCheck aria-hidden="true" size={18} />
        </span>
      </div>

      <label className="relative block">
        <span className="sr-only">Search clusters</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          size={15}
        />
        <input
          className="h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search clusters..."
          type="search"
          value={searchQuery}
        />
      </label>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
        <Filter aria-hidden="true" size={14} />
        Filters
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {statusFilters.map((f) => (
          <FilterButton
            active={filter === f.value}
            key={f.value}
            label={f.label}
            onClick={() => onFilterChange(f.value)}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {clusters.length > 0 ? (
          clusters.map((cluster) => (
            <ActionClusterCard
              cluster={cluster}
              isSelected={cluster.id === selectedClusterId}
              key={cluster.id}
              onClick={() => onSelectCluster(cluster.id)}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4 text-center">
            <p className="text-sm font-semibold text-[var(--rail-ink)]">
              No matching clusters
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function ActionClusterCard({
  cluster,
  isSelected,
  onClick,
}: {
  cluster: ManagerActionCluster;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`w-full rounded-lg border p-3 text-left transition ${
        isSelected
          ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] shadow-[var(--shadow-soft)]"
          : "border-[var(--rail-border)] bg-[var(--surface-panel)] hover:border-[var(--signal-blue)] hover:bg-[var(--background)]"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-sm font-semibold leading-5 text-[var(--rail-ink)]">
          {cluster.title}
        </h3>
        <StatusBadge status={cluster.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={cluster.category} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
        <span>{cluster.complaintCount} complaints</span>
        <span>{cluster.agentCount} agents</span>
        <span>{cluster.relativeTime}</span>
        <span className="truncate">
          {cluster.assignedManager ?? "Unassigned"}
        </span>
      </div>
    </button>
  );
}

function ClusterHeader({ cluster }: { cluster: ManagerActionCluster }) {
  return (
    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={cluster.status} />
            <CategoryBadge category={cluster.category} />
            <Badge>{cluster.displayId}</Badge>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-[var(--rail-ink)]">
            {cluster.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {cluster.complaintCount} complaints &middot;{" "}
            {cluster.agentCount} agents waiting &middot; raised{" "}
            {cluster.relativeTime}
          </p>
          {cluster.assignedManager ? (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Assigned to {cluster.assignedManager}
            </p>
          ) : null}
        </div>

        {!cluster.assignedManager && cluster.status === "pending" ? (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
            type="button"
          >
            <UserCheck aria-hidden="true" size={15} />
            Assign to me
          </button>
        ) : null}
      </div>
    </section>
  );
}

function ComplaintsInCluster({
  cluster,
}: {
  cluster: ManagerActionCluster;
}) {
  return (
    <Panel
      title="Complaints in this cluster"
    >
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        {cluster.complaintCount} complaints from{" "}
        {cluster.agentCount} agents — all waiting for internal action
      </p>

      <div className="space-y-3">
        {cluster.complaints.length > 0 ? (
          cluster.complaints.map((complaint) => (
            <article
              className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3"
              key={complaint.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--rail-ink)]">
                    {complaint.customerName}
                  </h4>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {sourceLabel[complaint.source] ?? complaint.source} &middot;{" "}
                    {complaint.agentName}
                  </p>
                </div>
                <Badge>{complaint.linkedTicketId}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--rail-ink)]">
                {complaint.complaintText}
              </p>
              <p className="mt-2 text-[11px] font-semibold text-[var(--text-muted)]">
                HEA sent &middot; waiting manager action
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4 text-center">
            <p className="text-sm font-semibold text-[var(--rail-ink)]">
              No complaints linked to this cluster
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ContextAndReferences({
  cluster,
}: {
  cluster: ManagerActionCluster;
}) {
  return (
    <Panel title="Context & references">
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        Retrieved by AI — used to generate cluster
      </p>

      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg bg-[var(--background)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Detected issue
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--rail-ink)]">
            {cluster.detectedIssue}
          </p>
          {cluster.similarPastCase ? (
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Similar past case: {cluster.similarPastCase}
            </p>
          ) : null}
        </div>
        <div className="space-y-3">
          <SummaryItem label="Policy applies" value={cluster.policyApplies} />
          {cluster.affectedRoute ? (
            <SummaryItem
              label="Affected service / route"
              value={cluster.affectedRoute}
            />
          ) : null}
          {cluster.recommendedAction ? (
            <SummaryItem
              label="Recommended action"
              value={cluster.recommendedAction}
            />
          ) : null}
        </div>
      </div>

      {cluster.references.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {cluster.references.map((ref) => (
            <span
              className="inline-flex min-h-6 items-center rounded-full bg-[var(--signal-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--signal-blue)]"
              key={ref.id}
            >
              {ref.title}
            </span>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}

function ManagerActionWorkspace({
  actionTaken,
  closureMessage,
  cluster,
  onActionTakenChange,
  onClosureMessageChange,
  onSubmit,
}: {
  actionTaken: string;
  closureMessage: string;
  cluster: ManagerActionCluster;
  onActionTakenChange: (v: string) => void;
  onClosureMessageChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Panel title="Complete action & notify agents">
      <div className="space-y-4">
        <FormField label="What action did you take?">
          <p className="mb-2 text-xs leading-5 text-[var(--text-muted)]">
            This is for internal record. Agents will see this in their ticket.
          </p>
          <textarea
            className={`${inputClassName()} min-h-[100px] resize-none py-3 leading-6`}
            onChange={(e) => onActionTakenChange(e.target.value)}
            placeholder="e.g. Coordinated with operations team — full refund approved for all passengers on the 17 May Surabaya–Jakarta delay."
            value={actionTaken}
          />
        </FormField>

        <FormField label="Closure message — sent to each agent, forwarded to their complainer">
          <p className="mb-2 text-xs leading-5 text-[var(--text-muted)]">
            Manager drafts or provides the final closure message that agents
            will send to each customer.
          </p>
          <textarea
            className={`${inputClassName()} min-h-[150px] resize-none py-3 leading-6`}
            onChange={(e) => onClosureMessageChange(e.target.value)}
            placeholder="Write the closure message for agents to forward..."
            value={closureMessage}
          />
        </FormField>

        <FormField label="Attachments / References">
          <p className="mb-2 text-xs leading-5 text-[var(--text-muted)]">
            Attach document, add reference URL. These will be visible in linked
            agent tickets.
          </p>
          <div className="flex gap-2">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              type="button"
            >
              <FileText aria-hidden="true" size={15} />
              Attach document
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              type="button"
            >
              <Link2 aria-hidden="true" size={15} />
              Add reference URL
            </button>
          </div>
        </FormField>

        <div className="flex justify-end border-t border-[var(--rail-border)] pt-4">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)]"
            onClick={onSubmit}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" size={18} />
            Complete action & notify agents
          </button>
        </div>
      </div>
    </Panel>
  );
}

function PreviewSection({
  actionTaken,
  closureMessage,
  references,
}: {
  actionTaken: string;
  closureMessage: string;
  references: { id: string; title: string }[];
}) {
  return (
    <Panel title="What agents will receive in their ticket inbox">
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Action taken
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--rail-ink)]">
            {actionTaken.trim() || (
              <span className="italic text-[var(--text-tertiary)]">
                Not yet filled
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Closure message to send complainer
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--rail-ink)]">
            {closureMessage.trim() || (
              <span className="italic text-[var(--text-tertiary)]">
                Not yet filled
              </span>
            )}
          </p>
        </div>

        {references.length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              References attached
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {references.map((ref) => (
                <span
                  className="inline-flex min-h-6 items-center rounded-full bg-[var(--signal-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--signal-blue)]"
                  key={ref.id}
                >
                  {ref.title}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function CompletionState({ cluster }: { cluster: ManagerActionCluster }) {
  return (
    <Panel title="Manager action completed — agents notified">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          All related agents have received the closure message in their ticket
          inbox. Each agent can now send it to their respective complainer and
          close the ticket.
        </p>

        <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]">
              <CheckCircle2 aria-hidden="true" size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--rail-ink)]">
                {cluster.displayId}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Completed by {cluster.completedBy ?? "Manager"} &middot;{" "}
                {cluster.completedAt ?? "now"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Notified agents
          </p>
          <div className="mt-2 space-y-2">
            {cluster.complaints.map((comp) => (
              <div
                className="flex items-center gap-2 text-sm text-[var(--rail-ink)]"
                key={comp.id}
              >
                <Users aria-hidden="true" className="text-[var(--signal-green)]" size={14} />
                <span className="font-medium">{comp.agentName}</span>
                <Badge>&#64;{comp.customerName.toLowerCase().replace(/\s+/g, "")}</Badge>
                <span className="text-[11px] text-[var(--signal-green)]">
                  &check; ready to notify
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Panel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="mb-3 text-sm font-semibold text-[var(--rail-ink)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="block">
      <span className="block text-xs font-semibold text-[var(--rail-ink)]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--background)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-5 text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--rail-border)] bg-[rgba(251,252,247,0.74)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-9 rounded-lg border px-3 text-left text-[11px] font-semibold transition ${
        active
          ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
          : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-blue)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: ManagerActionStatus }) {
  return (
    <Badge className={statusBadgeClass[status]}>
      {statusLabel[status]}
    </Badge>
  );
}

function CategoryBadge({
  category,
}: {
  category: ManagerActionCategory;
}) {
  return (
    <Badge className={categoryBadgeClass[category]}>
      {categoryLabel[category]}
    </Badge>
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
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        className ?? "bg-[var(--background)] text-[var(--text-muted)]"
      }`}
    >
      {children}
    </span>
  );
}

function inputClassName() {
  return "min-h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";
}
