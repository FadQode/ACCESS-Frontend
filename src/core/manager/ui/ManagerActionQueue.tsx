"use client";

import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Filter,
  Link2,
  Search,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import type {
  ActionClusterDetail,
  AffectedScope,
  ClusterPriority,
  ClusterStatus,
  DecisionStatus,
  SLAStatus,
} from "@/core/manager/model/action-queue.types";

const MANAGER = {
  id: "manager-001",
  name: "Maya R.",
};

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "needs_info", label: "Needs Info" },
  { value: "action_completed", label: "Done" },
];

const priorityFilters = [
  { value: "all", label: "All priority" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const decisionOptions = [
  { value: "", label: "Select decision" },
  { value: "refund_approved", label: "Refund approved" },
  { value: "reschedule_approved", label: "Reschedule approved" },
  { value: "compensation_approved", label: "Compensation approved" },
  { value: "compensation_not_eligible", label: "Compensation not eligible" },
  { value: "official_explanation_only", label: "Official explanation only" },
  { value: "need_more_customer_data", label: "Need more customer data" },
  {
    value: "forwarded_internal_department",
    label: "Forwarded to internal department",
  },
  { value: "escalate_higher_authority", label: "Escalate higher authority" },
  { value: "no_further_action", label: "No further action needed" },
];

const scopeOptions: { value: AffectedScope | ""; label: string }[] = [
  { value: "", label: "Select scope" },
  { value: "all", label: "All complaints in this cluster" },
  { value: "selected", label: "Selected complaints only" },
  { value: "future_similar", label: "Future similar complaints too" },
];

const decisionStatusOptions: { value: DecisionStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

const internalTeamOptions = [
  "Operations",
  "Refund Team",
  "Station Staff",
  "Lost and Found",
  "IT / Application Support",
  "Customer Relations",
  "Legal / Compliance",
  "Other",
];

const initialClusters: ActionClusterDetail[] = [
  {
    id: "CL-2026-0017",
    title: "Train delay - Surabaya-Jakarta line, 17 May",
    category: "Delay",
    subCategory: "Long delay / no notification",
    status: "pending",
    priority: "high",
    complaintCount: 5,
    agentCount: 3,
    affectedRoute: "Surabaya-Jakarta",
    incidentDate: "17 May 2026",
    timeWindow: "Morning departure batch",
    possibleRootCause: "Track maintenance - unconfirmed",
    rootCauseVerificationStatus: "partially_verified",
    groupingConfidence: "high",
    decisionStatus: "draft",
    slaStatus: "at_risk",
    slaDueAt: "1h 20m left",
    createdAt: "Raised 2h ago",
    updatedAt: "Updated 18m ago",
    actionSummary: "Coordinating delay report with operations team.",
    actionResult: "",
    agentInstruction:
      "Manager action pending. Agents should wait for operational confirmation before sending final follow-up to linked customers.",
    suggestedContext: {
      possibleRootCause: "Track maintenance - unconfirmed",
      confidence: "medium",
      detectedPattern:
        "Same route, same date, similar delay duration, and multiple passengers reporting no notification.",
      affectedScope:
        "Surabaya-Jakarta line, 17 May 2026, morning departure batch.",
      suggestedPolicy:
        "Refund or reschedule review may apply for delays above 3 hours.",
      relevantSources: [
        "SOP delay handling v2.1",
        "Refund policy v3.2",
        "Similar delay case, March 2026",
      ],
      neededVerification:
        "Confirm actual root cause, affected train numbers, and refund eligibility with operations.",
    },
    complaints: [
      {
        id: "CM-001",
        ticketId: "TK-1024",
        customerName: "Siti Nuraini",
        source: "twitter",
        complaintText:
          "Kereta delay 3 jam dari Surabaya, ada meeting penting, tidak ada notifikasi sama sekali.",
        assignedAgentId: "agent-001",
        assignedAgentName: "Rizky A.",
        ticketStatus: "Waiting Manager Action",
        sourceUrl: "https://x.example.com/post/1024",
        createdAt: "10:06",
      },
      {
        id: "CM-002",
        ticketId: "TK-1031",
        customerName: "Bagas Pratama",
        source: "instagram",
        complaintText:
          "Info keterlambatan tidak jelas. Penumpang hanya menunggu di stasiun tanpa arahan.",
        assignedAgentId: "agent-002",
        assignedAgentName: "Dina P.",
        ticketStatus: "Escalated",
        createdAt: "10:14",
      },
      {
        id: "CM-003",
        ticketId: "TK-1040",
        customerName: "Raka Mahendra",
        source: "web_form",
        complaintText:
          "Saya butuh kompensasi karena jadwal tiba berubah jauh dari tiket awal.",
        assignedAgentId: "agent-003",
        assignedAgentName: "Yusuf H.",
        ticketStatus: "Waiting Manager Action",
        createdAt: "10:31",
      },
    ],
    attachments: [
      {
        id: "AT-001",
        type: "url",
        label: "Delay incident report draft",
        url: "https://internal.example.com/incidents/delay-17-may",
        uploadedByName: "Operations Desk",
        createdAt: "10:36",
      },
    ],
    auditLogs: [
      {
        id: "AU-001",
        actorName: "System",
        action: "cluster_created",
        description: "Cluster created from 5 similar delay complaints.",
        createdAt: "10:12",
      },
      {
        id: "AU-002",
        actorName: "Operations Desk",
        action: "attachment_added",
        description: "Delay incident report draft linked for review.",
        createdAt: "10:36",
      },
    ],
  },
  {
    id: "CL-2026-0018",
    title: "Refund processing - cancelled trips May batch",
    category: "Refund",
    subCategory: "Refund not received",
    status: "in_progress",
    priority: "medium",
    assignedManagerId: "manager-001",
    assignedManagerName: "Maya R.",
    complaintCount: 2,
    agentCount: 2,
    affectedRoute: "Multiple routes",
    incidentDate: "16-18 May 2026",
    timeWindow: "Cancellation batch",
    possibleRootCause: "Payment gateway settlement queue",
    rootCauseVerificationStatus: "verified",
    groupingConfidence: "medium",
    decisionType: "forwarded_internal_department",
    decisionStatus: "in_progress",
    affectedScope: "all",
    internalTeam: "Refund Team",
    actionSummary: "Refund team is checking settlement status.",
    actionResult:
      "Initial check shows several refunds are waiting for gateway settlement confirmation.",
    agentInstruction:
      "Tell linked agents the refund batch is under finance review and avoid promising a fixed date until confirmation is received.",
    slaStatus: "healthy",
    slaDueAt: "5h 45m left",
    createdAt: "Raised 4h ago",
    updatedAt: "Updated 12m ago",
    suggestedContext: {
      possibleRootCause: "Payment gateway settlement queue",
      confidence: "medium",
      detectedPattern:
        "Two refund complaints reference cancelled May trips and similar waiting period.",
      affectedScope: "Cancelled trip refund requests from 16-18 May.",
      suggestedPolicy:
        "Refund team should verify payment channel status before final customer response.",
      relevantSources: ["Refund policy v3.2", "Gateway settlement SOP"],
      neededVerification:
        "Confirm payment method, booking IDs, and gateway settlement response.",
    },
    complaints: [
      {
        id: "CM-004",
        ticketId: "TK-1048",
        customerName: "Wulan Sari",
        source: "email",
        complaintText:
          "Refund tiket batal belum masuk setelah lebih dari seminggu.",
        assignedAgentId: "agent-004",
        assignedAgentName: "Laras N.",
        ticketStatus: "Internal Review",
        createdAt: "08:48",
      },
      {
        id: "CM-005",
        ticketId: "TK-1052",
        customerName: "Dedi Kusuma",
        source: "facebook",
        complaintText:
          "Pengembalian dana pembatalan belum diterima, customer service bilang tunggu terus.",
        assignedAgentId: "agent-002",
        assignedAgentName: "Dina P.",
        ticketStatus: "Waiting Internal Team",
        createdAt: "09:03",
      },
    ],
    attachments: [],
    auditLogs: [
      {
        id: "AU-003",
        actorName: "System",
        action: "cluster_created",
        description: "Cluster created from 2 refund complaints.",
        createdAt: "08:59",
      },
      {
        id: "AU-004",
        actorName: "Maya R.",
        action: "status_changed",
        description: "Status changed to In Progress.",
        createdAt: "09:12",
      },
    ],
  },
  {
    id: "CL-2026-0019",
    title: "Seat mismatch - executive coach B",
    category: "Seat",
    subCategory: "Seat mismatch",
    status: "needs_info",
    priority: "urgent",
    assignedManagerId: "manager-002",
    assignedManagerName: "Andi S.",
    complaintCount: 7,
    agentCount: 4,
    affectedRoute: "Bandung-Yogyakarta",
    incidentDate: "18 May 2026",
    timeWindow: "Evening departure",
    possibleRootCause: "Coach layout sync issue",
    rootCauseVerificationStatus: "unverified",
    groupingConfidence: "low",
    decisionStatus: "draft",
    slaStatus: "overdue",
    slaDueAt: "Overdue by 32m",
    createdAt: "Raised 6h ago",
    updatedAt: "Updated 6m ago",
    suggestedContext: {
      possibleRootCause: "Coach layout sync issue - unverified",
      confidence: "low",
      detectedPattern:
        "Multiple complaints mention executive coach B but details vary by seat number.",
      affectedScope: "Bandung-Yogyakarta evening departure.",
      suggestedPolicy:
        "Verify seat map, onboard report, and any coach substitution before deciding compensation.",
      relevantSources: ["Seat assignment SOP", "Coach substitution memo"],
      neededVerification:
        "Ask agents to collect booking IDs, coach numbers, and passenger seat photos where available.",
    },
    complaints: [
      {
        id: "CM-006",
        ticketId: "TK-1065",
        customerName: "Nabila Putri",
        source: "instagram",
        complaintText:
          "Nomor kursi di aplikasi beda dengan kursi di kereta, petugas juga bingung.",
        assignedAgentId: "agent-001",
        assignedAgentName: "Rizky A.",
        ticketStatus: "Needs Info",
        createdAt: "12:12",
      },
    ],
    attachments: [],
    auditLogs: [
      {
        id: "AU-005",
        actorName: "Andi S.",
        action: "info_requested",
        description:
          "Requested booking IDs and coach photos from all linked agents.",
        createdAt: "12:40",
      },
    ],
  },
  {
    id: "CL-2026-0020",
    title: "App login outage - OTP code not received",
    category: "Application",
    subCategory: "Login / OTP",
    status: "action_completed",
    priority: "medium",
    assignedManagerId: "manager-001",
    assignedManagerName: "Maya R.",
    complaintCount: 4,
    agentCount: 2,
    possibleRootCause: "SMS provider delivery delay",
    rootCauseVerificationStatus: "verified",
    groupingConfidence: "high",
    decisionType: "official_explanation_only",
    decisionStatus: "completed",
    affectedScope: "all",
    internalTeam: "IT / Application Support",
    actionSummary: "IT team confirmed SMS delivery delay and recovery window.",
    actionResult:
      "SMS provider issue has been resolved. Affected users can request a new OTP and retry login.",
    agentInstruction:
      "Notify linked agents that customers should retry OTP request and contact support if the issue continues after 15 minutes.",
    slaStatus: "healthy",
    slaDueAt: "Completed",
    createdAt: "Raised yesterday",
    updatedAt: "Completed 1h ago",
    resolvedAt: "Completed 1h ago",
    suggestedContext: {
      possibleRootCause: "SMS provider delivery delay",
      confidence: "high",
      detectedPattern:
        "Login complaints started in the same 40-minute window and mention missing OTP.",
      affectedScope: "Mobile app login, OTP delivery.",
      suggestedPolicy:
        "Provide official explanation and safe retry steps, no compensation required.",
      relevantSources: ["App incident log", "OTP troubleshooting SOP"],
      neededVerification: "Verified by IT support.",
    },
    complaints: [],
    attachments: [
      {
        id: "AT-002",
        type: "url",
        label: "IT recovery note",
        url: "https://internal.example.com/it/otp-recovery",
        uploadedByName: "IT Support",
        createdAt: "14:05",
      },
    ],
    auditLogs: [
      {
        id: "AU-006",
        actorName: "Maya R.",
        action: "action_completed",
        description: "Action completed and linked agents notified.",
        createdAt: "14:18",
      },
    ],
  },
];

export function ManagerActionQueue() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clusters, setClusters] =
    useState<ActionClusterDetail[]>(initialClusters);
  const [selectedClusterId, setSelectedClusterId] = useState(
    initialClusters[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [slaRiskOnly, setSlaRiskOnly] = useState(false);
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const selectedCluster =
    clusters.find((cluster) => cluster.id === selectedClusterId) ?? clusters[0];

  const pendingCount = clusters.filter(
    (cluster) =>
      cluster.status !== "action_completed" && cluster.status !== "resolved",
  ).length;
  const atRiskCount = clusters.filter(
    (cluster) => cluster.slaStatus !== "healthy",
  ).length;

  const visibleClusters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return clusters.filter((cluster) => {
      const searchableText = [
        cluster.id,
        cluster.title,
        cluster.category,
        cluster.subCategory,
        cluster.affectedRoute,
        cluster.affectedStation,
        cluster.incidentDate,
        cluster.assignedManagerName,
        ...cluster.complaints.flatMap((complaint) => [
          complaint.ticketId,
          complaint.customerName,
          complaint.assignedAgentName,
          complaint.complaintText,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus =
        statusFilter === "all" || cluster.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || cluster.priority === priorityFilter;
      const matchesSla =
        !slaRiskOnly ||
        cluster.slaStatus === "at_risk" ||
        cluster.slaStatus === "overdue";
      const matchesAssignee =
        !assignedToMeOnly || cluster.assignedManagerId === MANAGER.id;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesSla &&
        matchesAssignee
      );
    });
  }, [
    assignedToMeOnly,
    clusters,
    priorityFilter,
    searchQuery,
    slaRiskOnly,
    statusFilter,
  ]);

  const updateSelectedCluster = (patch: Partial<ActionClusterDetail>) => {
    setClusters((currentClusters) =>
      currentClusters.map((cluster) =>
        cluster.id === selectedCluster.id ? { ...cluster, ...patch } : cluster,
      ),
    );
  };

  const addAuditLog = (description: string, action: string) => {
    setClusters((currentClusters) =>
      currentClusters.map((cluster) => {
        if (cluster.id !== selectedCluster.id) {
          return cluster;
        }

        return {
          ...cluster,
          auditLogs: [
            {
              id: `AU-${Date.now()}`,
              actorName: MANAGER.name,
              action,
              description,
              createdAt: "Just now",
            },
            ...cluster.auditLogs,
          ],
        };
      }),
    );
  };

  const handleAssignToMe = () => {
    updateSelectedCluster({
      assignedManagerId: MANAGER.id,
      assignedManagerName: MANAGER.name,
      status:
        selectedCluster.status === "pending"
          ? "assigned"
          : selectedCluster.status,
      updatedAt: "Updated just now",
    });
    addAuditLog("Manager assigned: Maya R.", "manager_assigned");
    setCompletionMessage("");
  };

  const handleMarkInProgress = () => {
    updateSelectedCluster({
      status: "in_progress",
      decisionStatus: "in_progress",
      updatedAt: "Updated just now",
    });
    addAuditLog("Status changed to In Progress.", "status_changed");
    setCompletionMessage("");
  };

  const handleRequestInfo = () => {
    updateSelectedCluster({
      status: "needs_info",
      updatedAt: "Updated just now",
    });
    addAuditLog(
      "Requested more information from all linked agents.",
      "info_requested",
    );
    setCompletionMessage("Information request recorded for linked agents.");
  };

  const handleRemoveComplaint = (complaintId: string) => {
    setClusters((currentClusters) =>
      currentClusters.map((cluster) => {
        if (cluster.id !== selectedCluster.id) {
          return cluster;
        }

        const nextComplaints = cluster.complaints.filter(
          (complaint) => complaint.id !== complaintId,
        );

        return {
          ...cluster,
          complaints: nextComplaints,
          complaintCount: Math.max(cluster.complaintCount - 1, 0),
          updatedAt: "Updated just now",
          auditLogs: [
            {
              id: `AU-${Date.now()}`,
              actorName: MANAGER.name,
              action: "complaint_removed",
              description: "Complaint removed from this cluster.",
              createdAt: "Just now",
            },
            ...cluster.auditLogs,
          ],
        };
      }),
    );
  };

  const validateCompletion = () => {
    if (!selectedCluster.decisionType) {
      return "Select a decision type before completing this action.";
    }

    if (!selectedCluster.affectedScope) {
      return "Select the affected scope before completing this action.";
    }

    if (!selectedCluster.actionSummary?.trim()) {
      return "Write an action summary before completing this action.";
    }

    if (!selectedCluster.actionResult?.trim()) {
      return "Write the detailed action result before completing this action.";
    }

    if (
      !selectedCluster.agentInstruction?.trim() &&
      !selectedCluster.closureMessage?.trim()
    ) {
      return "Write an agent follow-up instruction or closure message.";
    }

    return "";
  };

  const handleOpenCompleteConfirmation = () => {
    const error = validateCompletion();
    setValidationMessage(error);

    if (!error) {
      setConfirmationOpen(true);
    }
  };

  const handleCompleteAction = () => {
    updateSelectedCluster({
      status: "action_completed",
      decisionStatus: "completed",
      resolvedAt: "Completed just now",
      slaDueAt: "Completed",
      slaStatus: "healthy",
      updatedAt: "Completed just now",
    });
    addAuditLog(
      `Action completed and ${selectedCluster.agentCount} agents notified.`,
      "action_completed",
    );
    setConfirmationOpen(false);
    setCompletionMessage(
      `${selectedCluster.complaintCount} linked tickets are now ready for final agent follow-up.`,
    );
  };

  if (!selectedCluster) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
        <section className="mx-auto flex min-h-[520px] max-w-4xl items-center justify-center rounded-[22px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center shadow-[var(--shadow-soft)]">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--rail-ink)]">
              No action requests yet.
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Complaint clusters requiring manager action will appear here.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="manager"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          stats={[
            { label: "Pending", value: pendingCount.toString() },
            { label: "SLA risk", value: atRiskCount.toString() },
            {
              label: "Clusters",
              value: clusters.length.toString(),
            },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            controls={
              <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                <ShieldAlert
                  aria-hidden="true"
                  className="text-[var(--signal-red)]"
                  size={15}
                />
                {atRiskCount} SLA risk
              </span>
            }
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((isOpen) => !isOpen)}
            roleLabel="Operations manager"
            userName={MANAGER.name}
          />

          <section className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
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
                    Resolve grouped complaint clusters once, then notify the
                    linked agents with a consistent operational result.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[430px]">
                  <MetricPill label="Pending clusters" value={pendingCount} />
                  <MetricPill label="Linked tickets" value={18} />
                  <MetricPill label="Agents affected" value={11} />
                </div>
              </div>
            </header>

            <div className="grid min-h-[760px] grid-cols-1 xl:grid-cols-[390px_minmax(0,1fr)]">
              <ActionQueueSidebar
                assignedToMeOnly={assignedToMeOnly}
                clusters={visibleClusters}
                pendingCount={pendingCount}
                priorityFilter={priorityFilter}
                searchQuery={searchQuery}
                selectedClusterId={selectedCluster.id}
                setAssignedToMeOnly={setAssignedToMeOnly}
                setPriorityFilter={setPriorityFilter}
                setSearchQuery={setSearchQuery}
                setSelectedClusterId={(clusterId) => {
                  setSelectedClusterId(clusterId);
                  setCompletionMessage("");
                  setValidationMessage("");
                }}
                setSlaRiskOnly={setSlaRiskOnly}
                setStatusFilter={setStatusFilter}
                slaRiskOnly={slaRiskOnly}
                statusFilter={statusFilter}
              />

              <section className="min-w-0 bg-[linear-gradient(180deg,#f8faf5_0%,#edf2ef_100%)] p-4 sm:p-5">
                <ClusterHeader
                  cluster={selectedCluster}
                  onAssignToMe={handleAssignToMe}
                  onComplete={handleOpenCompleteConfirmation}
                  onMarkInProgress={handleMarkInProgress}
                  onRequestInfo={handleRequestInfo}
                />

                {validationMessage ? (
                  <InlineAlert tone="danger">{validationMessage}</InlineAlert>
                ) : null}

                {completionMessage ? (
                  <InlineAlert tone="success">{completionMessage}</InlineAlert>
                ) : null}

                <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-4">
                    <ClusterSummaryCard cluster={selectedCluster} />
                    <ClusterComplaintList
                      cluster={selectedCluster}
                      onRemoveComplaint={handleRemoveComplaint}
                    />
                    <SuggestedContextCard cluster={selectedCluster} />
                    <ManagerDecisionForm
                      cluster={selectedCluster}
                      onChange={updateSelectedCluster}
                    />
                    <ActionResultForm
                      cluster={selectedCluster}
                      onChange={updateSelectedCluster}
                    />
                    <ClosurePreviewCard cluster={selectedCluster} />
                  </div>

                  <aside className="space-y-4">
                    <ReferencePanel cluster={selectedCluster} />
                    <AuditTrail cluster={selectedCluster} />
                  </aside>
                </div>
              </section>
            </div>
          </section>
        </section>
      </div>

      {confirmationOpen ? (
        <CompleteActionModal
          cluster={selectedCluster}
          onCancel={() => setConfirmationOpen(false)}
          onConfirm={handleCompleteAction}
        />
      ) : null}
    </main>
  );
}

function ActionQueueSidebar({
  assignedToMeOnly,
  clusters,
  pendingCount,
  priorityFilter,
  searchQuery,
  selectedClusterId,
  setAssignedToMeOnly,
  setPriorityFilter,
  setSearchQuery,
  setSelectedClusterId,
  setSlaRiskOnly,
  setStatusFilter,
  slaRiskOnly,
  statusFilter,
}: {
  assignedToMeOnly: boolean;
  clusters: ActionClusterDetail[];
  pendingCount: number;
  priorityFilter: string;
  searchQuery: string;
  selectedClusterId: string;
  setAssignedToMeOnly: (value: boolean) => void;
  setPriorityFilter: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSelectedClusterId: (clusterId: string) => void;
  setSlaRiskOnly: (value: boolean) => void;
  setStatusFilter: (value: string) => void;
  slaRiskOnly: boolean;
  statusFilter: string;
}) {
  return (
    <aside className="border-b border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 xl:border-b-0 xl:border-r">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--rail-ink)]">
            Action Queue
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {pendingCount} pending
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
          onChange={(event) => setSearchQuery(event.target.value)}
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
        {statusFilters.map((filter) => (
          <FilterButton
            active={statusFilter === filter.value}
            key={filter.value}
            label={filter.label}
            onClick={() => setStatusFilter(filter.value)}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {priorityFilters.map((filter) => (
          <FilterButton
            active={priorityFilter === filter.value}
            key={filter.value}
            label={filter.label}
            onClick={() => setPriorityFilter(filter.value)}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <ToggleButton
          active={slaRiskOnly}
          label="SLA risk"
          onClick={() => setSlaRiskOnly(!slaRiskOnly)}
        />
        <ToggleButton
          active={assignedToMeOnly}
          label="Assigned to me"
          onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
        />
      </div>

      <div className="mt-4 space-y-3">
        {clusters.length > 0 ? (
          clusters.map((cluster) => (
            <ActionClusterCard
              cluster={cluster}
              isSelected={cluster.id === selectedClusterId}
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4 text-center">
            <p className="text-sm font-semibold text-[var(--rail-ink)]">
              No matching clusters found.
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Try changing your search keyword or filters.
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
  cluster: ActionClusterDetail;
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
        <PriorityBadge priority={cluster.priority} />
        <Badge>{cluster.category}</Badge>
        <SLABadge status={cluster.slaStatus} label={cluster.slaDueAt} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
        <span>{cluster.complaintCount} complaints</span>
        <span>{cluster.agentCount} agents</span>
        <span>{cluster.createdAt}</span>
        <span className="truncate">
          {cluster.assignedManagerName ?? "Unassigned"}
        </span>
      </div>
    </button>
  );
}

function ClusterHeader({
  cluster,
  onAssignToMe,
  onComplete,
  onMarkInProgress,
  onRequestInfo,
}: {
  cluster: ActionClusterDetail;
  onAssignToMe: () => void;
  onComplete: () => void;
  onMarkInProgress: () => void;
  onRequestInfo: () => void;
}) {
  return (
    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={cluster.status} />
            <PriorityBadge priority={cluster.priority} />
            <SLABadge status={cluster.slaStatus} label={cluster.slaDueAt} />
          </div>
          <h2 className="mt-3 text-xl font-semibold text-[var(--rail-ink)]">
            {cluster.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {cluster.complaintCount} complaints waiting across{" "}
            {cluster.agentCount} agents. Raised{" "}
            {cluster.createdAt.toLowerCase()}.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[420px]">
          <ActionButton
            icon={<UserCheck aria-hidden="true" size={15} />}
            label="Assign to me"
            onClick={onAssignToMe}
          />
          <ActionButton
            icon={<Clock3 aria-hidden="true" size={15} />}
            label="Mark In Progress"
            onClick={onMarkInProgress}
          />
          <ActionButton
            icon={<CheckCircle2 aria-hidden="true" size={15} />}
            label="Complete Action"
            onClick={onComplete}
            tone="primary"
          />
          <ActionButton
            icon={<AlertCircle aria-hidden="true" size={15} />}
            label="Request More Info"
            onClick={onRequestInfo}
          />
        </div>
      </div>
    </section>
  );
}

function ClusterSummaryCard({ cluster }: { cluster: ActionClusterDetail }) {
  return (
    <Panel title="Cluster Summary">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryItem label="Cluster ID" value={cluster.id} />
        <SummaryItem label="Category" value={cluster.category} />
        <SummaryItem label="Sub-category" value={cluster.subCategory ?? "-"} />
        <SummaryItem
          label="Affected route"
          value={cluster.affectedRoute ?? "Multiple / unknown"}
        />
        <SummaryItem
          label="Incident date"
          value={cluster.incidentDate ?? "Needs verification"}
        />
        <SummaryItem
          label="Time window"
          value={cluster.timeWindow ?? "Needs verification"}
        />
        <SummaryItem
          label="Assigned manager"
          value={cluster.assignedManagerName ?? "Unassigned"}
        />
        <SummaryItem
          label="Grouping"
          value={confidenceLabel(cluster.groupingConfidence)}
        />
        <SummaryItem
          label="Verification"
          value={verificationLabel(cluster.rootCauseVerificationStatus)}
        />
      </div>
    </Panel>
  );
}

function ClusterComplaintList({
  cluster,
  onRemoveComplaint,
}: {
  cluster: ActionClusterDetail;
  onRemoveComplaint: (complaintId: string) => void;
}) {
  return (
    <Panel
      action={
        <span className="rounded-full bg-[var(--background)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
          {cluster.complaints.length} linked
        </span>
      }
      title="Complaints in Cluster"
    >
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
                    via {sourceLabel(complaint.source)} - Agent{" "}
                    {complaint.assignedAgentName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{complaint.ticketId}</Badge>
                  <Badge>{complaint.ticketStatus}</Badge>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--rail-ink)]">
                {complaint.complaintText}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton
                  icon={<FileText aria-hidden="true" size={14} />}
                  label="View ticket"
                  onClick={() => undefined}
                  small
                />
                {complaint.sourceUrl ? (
                  <ActionButton
                    icon={<Link2 aria-hidden="true" size={14} />}
                    label="Open source URL"
                    onClick={() => undefined}
                    small
                  />
                ) : null}
                <ActionButton
                  icon={<X aria-hidden="true" size={14} />}
                  label="Remove from cluster"
                  onClick={() => onRemoveComplaint(complaint.id)}
                  small
                  tone="danger"
                />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4 text-center">
            <p className="text-sm font-semibold text-[var(--rail-ink)]">
              This cluster has no linked complaints.
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              It may have been split, merged, or archived.
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function SuggestedContextCard({ cluster }: { cluster: ActionClusterDetail }) {
  const context = cluster.suggestedContext;

  if (!context) {
    return null;
  }

  return (
    <Panel
      action={
        <Badge tone="blue">
          {confidenceLabel(context.confidence)} confidence
        </Badge>
      }
      title="System-Suggested Context"
    >
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg bg-[var(--background)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Possible root cause
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--rail-ink)]">
            {context.possibleRootCause}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {context.detectedPattern}
          </p>
        </div>
        <div className="space-y-3">
          <SummaryItem label="Affected scope" value={context.affectedScope} />
          <SummaryItem
            label="Suggested policy"
            value={context.suggestedPolicy}
          />
          <SummaryItem
            label="Needed verification"
            value={context.neededVerification}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {context.relevantSources.map((source) => (
          <Badge key={source}>{source}</Badge>
        ))}
      </div>
    </Panel>
  );
}

function ManagerDecisionForm({
  cluster,
  onChange,
}: {
  cluster: ActionClusterDetail;
  onChange: (patch: Partial<ActionClusterDetail>) => void;
}) {
  return (
    <Panel title="Manager Decision">
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Decision type">
          <select
            className={inputClassName()}
            onChange={(event) => onChange({ decisionType: event.target.value })}
            value={cluster.decisionType ?? ""}
          >
            {decisionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Affected scope">
          <select
            className={inputClassName()}
            onChange={(event) =>
              onChange({ affectedScope: event.target.value as AffectedScope })
            }
            value={cluster.affectedScope ?? ""}
          >
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Internal team">
          <select
            className={inputClassName()}
            onChange={(event) => onChange({ internalTeam: event.target.value })}
            value={cluster.internalTeam ?? ""}
          >
            <option value="">Select team</option>
            {internalTeamOptions.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Decision status">
          <select
            className={inputClassName()}
            onChange={(event) =>
              onChange({ decisionStatus: event.target.value as DecisionStatus })
            }
            value={cluster.decisionStatus ?? "draft"}
          >
            {decisionStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </Panel>
  );
}

function ActionResultForm({
  cluster,
  onChange,
}: {
  cluster: ActionClusterDetail;
  onChange: (patch: Partial<ActionClusterDetail>) => void;
}) {
  return (
    <Panel title="Action Result">
      <div className="grid gap-3">
        <FormField label="Action summary">
          <input
            className={inputClassName()}
            onChange={(event) =>
              onChange({ actionSummary: event.target.value })
            }
            placeholder="Coordinated with operations and refund team."
            type="text"
            value={cluster.actionSummary ?? ""}
          />
        </FormField>
        <FormField label="Detailed action result">
          <textarea
            className={`${inputClassName()} min-h-[150px] resize-none py-3 leading-6`}
            onChange={(event) => onChange({ actionResult: event.target.value })}
            placeholder="Write the official operational result here."
            value={cluster.actionResult ?? ""}
          />
        </FormField>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Reference URL">
            <input
              className={inputClassName()}
              onChange={(event) =>
                onChange({ referenceUrl: event.target.value })
              }
              placeholder="https://internal.example.com/reference"
              type="url"
              value={cluster.referenceUrl ?? ""}
            />
          </FormField>
          <FormField label="Additional manager notes">
            <input
              className={inputClassName()}
              onChange={(event) =>
                onChange({ managerNotes: event.target.value })
              }
              placeholder="Optional internal note"
              type="text"
              value={cluster.managerNotes ?? ""}
            />
          </FormField>
        </div>
      </div>
    </Panel>
  );
}

function ClosurePreviewCard({ cluster }: { cluster: ActionClusterDetail }) {
  return (
    <Panel
      action={<Badge tone="green">Notify agents only</Badge>}
      title="Closure / Agent Follow-up Preview"
    >
      <FormField label="Agent follow-up message">
        <textarea
          className={`${inputClassName()} min-h-[150px] resize-none py-3 leading-6`}
          readOnly
          value={buildAgentInstruction(cluster)}
        />
      </FormField>
    </Panel>
  );
}

function ReferencePanel({ cluster }: { cluster: ActionClusterDetail }) {
  return (
    <Panel title="Evidence and References">
      <div className="space-y-3">
        {cluster.referenceUrl ? (
          <ReferenceRow
            label="Manager reference URL"
            uploadedByName={MANAGER.name}
            url={cluster.referenceUrl}
          />
        ) : null}
        {cluster.attachments.map((attachment) => (
          <ReferenceRow
            key={attachment.id}
            label={attachment.label}
            uploadedByName={attachment.uploadedByName}
            url={attachment.url}
          />
        ))}
        {!cluster.referenceUrl && cluster.attachments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4 text-sm text-[var(--text-muted)]">
            Add a reference URL in the action result form to keep evidence
            linked to the manager decision.
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function ReferenceRow({
  label,
  uploadedByName,
  url,
}: {
  label: string;
  uploadedByName: string;
  url: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <div className="flex items-start gap-2">
        <Link2
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-[var(--signal-blue)]"
          size={15}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--rail-ink)]">
            {label}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
            {uploadedByName} - {url}
          </p>
        </div>
      </div>
    </div>
  );
}

function AuditTrail({ cluster }: { cluster: ActionClusterDetail }) {
  return (
    <Panel title="Audit Trail">
      <ol className="space-y-3">
        {cluster.auditLogs.map((log) => (
          <li className="relative pl-5" key={log.id}>
            <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[var(--signal-blue)]" />
            <p className="text-xs font-semibold text-[var(--rail-ink)]">
              {log.createdAt} - {log.actorName}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              {log.description}
            </p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function CompleteActionModal({
  cluster,
  onCancel,
  onConfirm,
}: {
  cluster: ActionClusterDetail;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(19,35,31,0.38)] p-4">
      <section className="w-full max-w-lg rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-ops)]">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]">
            <AlertCircle aria-hidden="true" size={21} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--rail-ink)]">
              Complete action and notify agents?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              This action will update {cluster.complaintCount} linked tickets
              and notify {cluster.agentCount} agents. Review the decision and
              action result before continuing.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            className="h-11 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 text-sm font-semibold text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-11 rounded-lg bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)]"
            onClick={onConfirm}
            type="button"
          >
            Complete Action & Notify Agents
          </button>
        </div>
      </section>
    </div>
  );
}

function Panel({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
          {title}
        </h3>
        {action}
      </div>
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

function InlineAlert({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "danger" | "success";
}) {
  return (
    <div
      className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
        tone === "danger"
          ? "border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]"
          : "border-[var(--signal-green)] bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
      }`}
    >
      {children}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  small = false,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  small?: boolean;
  tone?: "default" | "primary" | "danger";
}) {
  const colorClass =
    tone === "primary"
      ? "border-[var(--rail-ink)] bg-[var(--rail-ink)] text-white hover:bg-[var(--signal-blue)]"
      : tone === "danger"
        ? "border-[var(--signal-red-soft)] bg-[var(--surface-panel)] text-[var(--signal-red-dark)] hover:bg-[var(--signal-red-soft)]"
        : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--rail-ink)] hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]";

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${colorClass} ${
        small ? "min-h-9" : "min-h-10"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
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

function ToggleButton({
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
          ? "border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]"
          : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-amber)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: ClusterStatus }) {
  const classes: Record<ClusterStatus, string> = {
    action_completed:
      "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    assigned: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    cancelled: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    in_progress: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    merged: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    needs_info: "bg-[#ede4f7] text-[#6b3fa0]",
    pending: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    resolved: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    waiting_internal_team:
      "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  };

  return <Badge className={classes[status]}>{statusLabel(status)}</Badge>;
}

function PriorityBadge({ priority }: { priority: ClusterPriority }) {
  const classes: Record<ClusterPriority, string> = {
    high: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    low: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    medium: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    urgent: "bg-[var(--signal-red)] text-white",
  };

  return <Badge className={classes[priority]}>{priorityLabel(priority)}</Badge>;
}

function SLABadge({ label, status }: { label: string; status: SLAStatus }) {
  const classes: Record<SLAStatus, string> = {
    at_risk: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    healthy: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    overdue: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
  };

  return <Badge className={classes[status]}>SLA: {label}</Badge>;
}

function Badge({
  children,
  className,
  tone,
}: {
  children: ReactNode;
  className?: string;
  tone?: "blue" | "green";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
      : tone === "green"
        ? "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
        : "bg-[var(--background)] text-[var(--text-muted)]";

  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${className ?? toneClass}`}
    >
      {children}
    </span>
  );
}

function inputClassName() {
  return "min-h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";
}

function buildAgentInstruction(cluster: ActionClusterDetail) {
  if (cluster.agentInstruction?.trim()) {
    return cluster.agentInstruction;
  }

  const result = cluster.actionResult?.trim()
    ? cluster.actionResult
    : "Manager action result is not complete yet.";

  return `Manager action completed.\n\nResult:\n${result}\n\nInstruction for agents:\nPlease send a final follow-up response to each linked customer using the approved operational result above.`;
}

function statusLabel(status: ClusterStatus) {
  const labels: Record<ClusterStatus, string> = {
    action_completed: "Done",
    assigned: "Assigned",
    cancelled: "Cancelled",
    in_progress: "In Progress",
    merged: "Merged",
    needs_info: "Needs Info",
    pending: "Pending",
    resolved: "Resolved",
    waiting_internal_team: "Waiting Team",
  };

  return labels[status];
}

function priorityLabel(priority: ClusterPriority) {
  const labels: Record<ClusterPriority, string> = {
    high: "High Priority",
    low: "Low Priority",
    medium: "Medium Priority",
    urgent: "Urgent",
  };

  return labels[priority];
}

function confidenceLabel(confidence: string) {
  const labels: Record<string, string> = {
    high: "High",
    low: "Low",
    manual: "Manual grouping",
    medium: "Medium",
  };

  return labels[confidence] ?? confidence;
}

function verificationLabel(status: string) {
  const labels: Record<string, string> = {
    partially_verified: "Partially Verified",
    rejected: "Rejected",
    unverified: "Unverified",
    verified: "Verified",
  };

  return labels[status] ?? status;
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    email: "Email",
    facebook: "Facebook",
    instagram: "Instagram",
    manual: "Manual",
    twitter: "X / Twitter",
    web_form: "Web form",
  };

  return labels[source] ?? source;
}
