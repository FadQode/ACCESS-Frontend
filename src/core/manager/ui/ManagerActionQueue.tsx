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
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "in_progress", label: "Diproses" },
  { value: "needs_info", label: "Butuh Info" },
  { value: "action_completed", label: "Selesai" },
];

const priorityFilters = [
  { value: "all", label: "Semua prioritas" },
  { value: "urgent", label: "Mendesak" },
  { value: "high", label: "Tinggi" },
  { value: "medium", label: "Sedang" },
  { value: "low", label: "Rendah" },
];

const decisionOptions = [
  { value: "", label: "Pilih keputusan" },
  { value: "refund_approved", label: "Pengembalian dana disetujui" },
  { value: "reschedule_approved", label: "Jadwal ulang disetujui" },
  { value: "compensation_approved", label: "Kompensasi disetujui" },
  {
    value: "compensation_not_eligible",
    label: "Tidak memenuhi syarat kompensasi",
  },
  { value: "official_explanation_only", label: "Hanya penjelasan resmi" },
  { value: "need_more_customer_data", label: "Butuh data pelanggan tambahan" },
  {
    value: "forwarded_internal_department",
    label: "Diteruskan ke tim internal",
  },
  {
    value: "escalate_higher_authority",
    label: "Eskalasi ke otoritas lebih tinggi",
  },
  { value: "no_further_action", label: "Tidak perlu tindak lanjut" },
];

const scopeOptions: { value: AffectedScope | ""; label: string }[] = [
  { value: "", label: "Pilih cakupan" },
  { value: "all", label: "Semua keluhan di klaster ini" },
  { value: "selected", label: "Hanya keluhan yang dipilih" },
  { value: "future_similar", label: "Termasuk keluhan serupa berikutnya" },
];

const decisionStatusOptions: { value: DecisionStatus; label: string }[] = [
  { value: "draft", label: "Draf" },
  { value: "in_progress", label: "Diproses" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "completed", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
];

const internalTeamOptions = [
  "Operasional",
  "Tim Pengembalian Dana",
  "Petugas Stasiun",
  "Barang Tertinggal",
  "IT / Bantuan Aplikasi",
  "Relasi Pelanggan",
  "Legal / Kepatuhan",
  "Lainnya",
];

const initialClusters: ActionClusterDetail[] = [
  {
    id: "CL-2026-0017",
    title: "Keterlambatan kereta - lintas Surabaya-Jakarta, 17 Mei",
    category: "Keterlambatan",
    subCategory: "Terlambat lama / tanpa notifikasi",
    status: "pending",
    priority: "high",
    complaintCount: 5,
    agentCount: 3,
    affectedRoute: "Surabaya-Jakarta",
    incidentDate: "17 Mei 2026",
    timeWindow: "Keberangkatan pagi",
    possibleRootCause: "Perawatan jalur - belum terkonfirmasi",
    rootCauseVerificationStatus: "partially_verified",
    groupingConfidence: "high",
    decisionStatus: "draft",
    slaStatus: "at_risk",
    slaDueAt: "Sisa 1 jam 20 menit",
    createdAt: "Dibuat 2 jam lalu",
    updatedAt: "Diperbarui 18 menit lalu",
    actionSummary:
      "Laporan keterlambatan sedang dikoordinasikan dengan tim operasional.",
    actionResult: "",
    agentInstruction:
      "Menunggu arahan manajer. Agen perlu menunggu konfirmasi operasional sebelum mengirim tindak lanjut akhir ke pelanggan terkait.",
    suggestedContext: {
      possibleRootCause: "Perawatan jalur - belum terkonfirmasi",
      confidence: "medium",
      detectedPattern:
        "Rute sama, tanggal sama, durasi keterlambatan mirip, dan beberapa penumpang melaporkan tidak ada notifikasi.",
      affectedScope:
        "Lintas Surabaya-Jakarta, 17 Mei 2026, keberangkatan pagi.",
      suggestedPolicy:
        "Pengembalian dana atau jadwal ulang dapat ditinjau untuk keterlambatan di atas 3 jam.",
      relevantSources: [
        "SOP penanganan keterlambatan v2.1",
        "Kebijakan pengembalian dana v3.2",
        "Kasus keterlambatan serupa, Maret 2026",
      ],
      neededVerification:
        "Konfirmasi penyebab aktual, nomor kereta terdampak, dan kelayakan pengembalian dana dengan operasional.",
    },
    complaints: [
      {
        id: "CM-001",
        ticketId: "TK-1024",
        customerName: "Siti Nuraini",
        source: "twitter",
        complaintText:
          "Kereta terlambat 3 jam dari Surabaya, ada meeting penting, tidak ada notifikasi sama sekali.",
        assignedAgentId: "agent-001",
        assignedAgentName: "Rizky A.",
        ticketStatus: "Menunggu Arahan Manajer",
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
        ticketStatus: "Dieskalasi",
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
        ticketStatus: "Menunggu Arahan Manajer",
        createdAt: "10:31",
      },
    ],
    attachments: [
      {
        id: "AT-001",
        type: "url",
        label: "Draf laporan insiden keterlambatan",
        url: "https://internal.example.com/incidents/delay-17-may",
        uploadedByName: "Meja Operasional",
        createdAt: "10:36",
      },
    ],
    auditLogs: [
      {
        id: "AU-001",
        actorName: "Sistem",
        action: "cluster_created",
        description: "Klaster dibuat dari 5 keluhan keterlambatan serupa.",
        createdAt: "10:12",
      },
      {
        id: "AU-002",
        actorName: "Meja Operasional",
        action: "attachment_added",
        description:
          "Draf laporan insiden keterlambatan ditautkan untuk ditinjau.",
        createdAt: "10:36",
      },
    ],
  },
  {
    id: "CL-2026-0018",
    title: "Proses pengembalian dana - batch perjalanan batal bulan Mei",
    category: "Pengembalian Dana",
    subCategory: "Pengembalian dana belum diterima",
    status: "in_progress",
    priority: "medium",
    assignedManagerId: "manager-001",
    assignedManagerName: "Maya R.",
    complaintCount: 2,
    agentCount: 2,
    affectedRoute: "Beberapa rute",
    incidentDate: "16-18 Mei 2026",
    timeWindow: "Batch pembatalan",
    possibleRootCause: "Antrean settlement payment gateway",
    rootCauseVerificationStatus: "verified",
    groupingConfidence: "medium",
    decisionType: "forwarded_internal_department",
    decisionStatus: "in_progress",
    affectedScope: "all",
    internalTeam: "Tim Pengembalian Dana",
    actionSummary: "Tim pengembalian dana sedang memeriksa status settlement.",
    actionResult:
      "Pengecekan awal menunjukkan beberapa pengembalian dana masih menunggu konfirmasi settlement gateway.",
    agentInstruction:
      "Beri tahu agen terkait bahwa batch pengembalian dana masih ditinjau tim keuangan dan jangan menjanjikan tanggal pasti sebelum ada konfirmasi.",
    slaStatus: "healthy",
    slaDueAt: "Sisa 5 jam 45 menit",
    createdAt: "Dibuat 4 jam lalu",
    updatedAt: "Diperbarui 12 menit lalu",
    suggestedContext: {
      possibleRootCause: "Antrean settlement payment gateway",
      confidence: "medium",
      detectedPattern:
        "Dua keluhan pengembalian dana merujuk perjalanan batal bulan Mei dan waktu tunggu yang mirip.",
      affectedScope:
        "Permintaan pengembalian dana perjalanan batal dari 16-18 Mei.",
      suggestedPolicy:
        "Tim pengembalian dana perlu memverifikasi status kanal pembayaran sebelum balasan akhir ke pelanggan.",
      relevantSources: [
        "Kebijakan pengembalian dana v3.2",
        "SOP settlement gateway",
      ],
      neededVerification:
        "Konfirmasi metode pembayaran, ID booking, dan respons settlement gateway.",
    },
    complaints: [
      {
        id: "CM-004",
        ticketId: "TK-1048",
        customerName: "Wulan Sari",
        source: "email",
        complaintText:
          "Pengembalian dana tiket batal belum masuk setelah lebih dari seminggu.",
        assignedAgentId: "agent-004",
        assignedAgentName: "Laras N.",
        ticketStatus: "Tinjauan Internal",
        createdAt: "08:48",
      },
      {
        id: "CM-005",
        ticketId: "TK-1052",
        customerName: "Dedi Kusuma",
        source: "facebook",
        complaintText:
          "Pengembalian dana pembatalan belum diterima, layanan pelanggan hanya meminta menunggu.",
        assignedAgentId: "agent-002",
        assignedAgentName: "Dina P.",
        ticketStatus: "Menunggu Tim Internal",
        createdAt: "09:03",
      },
    ],
    attachments: [],
    auditLogs: [
      {
        id: "AU-003",
        actorName: "Sistem",
        action: "cluster_created",
        description: "Klaster dibuat dari 2 keluhan pengembalian dana.",
        createdAt: "08:59",
      },
      {
        id: "AU-004",
        actorName: "Maya R.",
        action: "status_changed",
        description: "Status diubah menjadi Diproses.",
        createdAt: "09:12",
      },
    ],
  },
  {
    id: "CL-2026-0019",
    title: "Ketidaksesuaian kursi - gerbong eksekutif B",
    category: "Kursi",
    subCategory: "Kursi tidak sesuai",
    status: "needs_info",
    priority: "urgent",
    assignedManagerId: "manager-002",
    assignedManagerName: "Andi S.",
    complaintCount: 7,
    agentCount: 4,
    affectedRoute: "Bandung-Yogyakarta",
    incidentDate: "18 Mei 2026",
    timeWindow: "Keberangkatan malam",
    possibleRootCause: "Sinkronisasi denah gerbong bermasalah",
    rootCauseVerificationStatus: "unverified",
    groupingConfidence: "low",
    decisionStatus: "draft",
    slaStatus: "overdue",
    slaDueAt: "Terlambat 32 menit",
    createdAt: "Dibuat 6 jam lalu",
    updatedAt: "Diperbarui 6 menit lalu",
    suggestedContext: {
      possibleRootCause:
        "Sinkronisasi denah gerbong bermasalah - belum diverifikasi",
      confidence: "low",
      detectedPattern:
        "Beberapa keluhan menyebut gerbong eksekutif B, tetapi detailnya berbeda per nomor kursi.",
      affectedScope: "Keberangkatan malam Bandung-Yogyakarta.",
      suggestedPolicy:
        "Verifikasi denah kursi, laporan di kereta, dan kemungkinan penggantian gerbong sebelum memutuskan kompensasi.",
      relevantSources: ["SOP penetapan kursi", "Memo penggantian gerbong"],
      neededVerification:
        "Minta agen mengumpulkan ID booking, nomor gerbong, dan foto kursi penumpang jika tersedia.",
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
        ticketStatus: "Butuh Info",
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
          "Meminta ID booking dan foto gerbong dari semua agen terkait.",
        createdAt: "12:40",
      },
    ],
  },
  {
    id: "CL-2026-0020",
    title: "Gangguan login aplikasi - kode OTP tidak diterima",
    category: "Aplikasi",
    subCategory: "Login / OTP",
    status: "action_completed",
    priority: "medium",
    assignedManagerId: "manager-001",
    assignedManagerName: "Maya R.",
    complaintCount: 4,
    agentCount: 2,
    possibleRootCause: "Keterlambatan pengiriman dari provider SMS",
    rootCauseVerificationStatus: "verified",
    groupingConfidence: "high",
    decisionType: "official_explanation_only",
    decisionStatus: "completed",
    affectedScope: "all",
    internalTeam: "IT / Bantuan Aplikasi",
    actionSummary:
      "Tim IT mengonfirmasi keterlambatan pengiriman SMS dan estimasi pemulihan.",
    actionResult:
      "Kendala provider SMS sudah terselesaikan. Pengguna terdampak dapat meminta OTP baru dan mencoba login lagi.",
    agentInstruction:
      "Beri tahu agen terkait agar pelanggan mencoba meminta OTP ulang dan menghubungi kanal bantuan jika kendala masih terjadi setelah 15 menit.",
    slaStatus: "healthy",
    slaDueAt: "Selesai",
    createdAt: "Dibuat kemarin",
    updatedAt: "Selesai 1 jam lalu",
    resolvedAt: "Selesai 1 jam lalu",
    suggestedContext: {
      possibleRootCause: "Keterlambatan pengiriman dari provider SMS",
      confidence: "high",
      detectedPattern:
        "Keluhan login muncul dalam rentang 40 menit yang sama dan menyebut OTP tidak diterima.",
      affectedScope: "Login aplikasi mobile, pengiriman OTP.",
      suggestedPolicy:
        "Berikan penjelasan resmi dan langkah coba ulang yang aman; tidak perlu kompensasi.",
      relevantSources: ["Log insiden aplikasi", "SOP kendala OTP"],
      neededVerification: "Terverifikasi oleh tim IT.",
    },
    complaints: [],
    attachments: [
      {
        id: "AT-002",
        type: "url",
        label: "Catatan pemulihan IT",
        url: "https://internal.example.com/it/otp-recovery",
        uploadedByName: "Tim IT",
        createdAt: "14:05",
      },
    ],
    auditLogs: [
      {
        id: "AU-006",
        actorName: "Maya R.",
        action: "action_completed",
        description: "Tindakan selesai dan agen terkait sudah diberi tahu.",
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
              createdAt: "Baru saja",
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
      updatedAt: "Diperbarui baru saja",
    });
    addAuditLog("Manajer ditetapkan: Maya R.", "manager_assigned");
    setCompletionMessage("");
  };

  const handleMarkInProgress = () => {
    updateSelectedCluster({
      status: "in_progress",
      decisionStatus: "in_progress",
      updatedAt: "Diperbarui baru saja",
    });
    addAuditLog("Status diubah menjadi Diproses.", "status_changed");
    setCompletionMessage("");
  };

  const handleRequestInfo = () => {
    updateSelectedCluster({
      status: "needs_info",
      updatedAt: "Diperbarui baru saja",
    });
    addAuditLog(
      "Meminta informasi tambahan dari semua agen terkait.",
      "info_requested",
    );
    setCompletionMessage("Permintaan informasi dicatat untuk agen terkait.");
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
          updatedAt: "Diperbarui baru saja",
          auditLogs: [
            {
              id: `AU-${Date.now()}`,
              actorName: MANAGER.name,
              action: "complaint_removed",
              description: "Keluhan dihapus dari klaster ini.",
              createdAt: "Baru saja",
            },
            ...cluster.auditLogs,
          ],
        };
      }),
    );
  };

  const validateCompletion = () => {
    if (!selectedCluster.decisionType) {
      return "Pilih jenis keputusan sebelum menyelesaikan tindakan ini.";
    }

    if (!selectedCluster.affectedScope) {
      return "Pilih cakupan terdampak sebelum menyelesaikan tindakan ini.";
    }

    if (!selectedCluster.actionSummary?.trim()) {
      return "Tulis ringkasan tindakan sebelum menyelesaikan tindakan ini.";
    }

    if (!selectedCluster.actionResult?.trim()) {
      return "Tulis hasil tindakan secara rinci sebelum menyelesaikan tindakan ini.";
    }

    if (
      !selectedCluster.agentInstruction?.trim() &&
      !selectedCluster.closureMessage?.trim()
    ) {
      return "Tulis instruksi tindak lanjut untuk agen atau balasan akhir.";
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
      resolvedAt: "Selesai baru saja",
      slaDueAt: "Selesai",
      slaStatus: "healthy",
      updatedAt: "Selesai baru saja",
    });
    addAuditLog(
      `Tindakan selesai dan ${selectedCluster.agentCount} agen diberi tahu.`,
      "action_completed",
    );
    setConfirmationOpen(false);
    setCompletionMessage(
      `${selectedCluster.complaintCount} tiket terkait siap untuk tindak lanjut akhir oleh agen.`,
    );
  };

  if (!selectedCluster) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
        <section className="mx-auto flex min-h-[520px] max-w-4xl items-center justify-center rounded-[22px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center shadow-[var(--shadow-soft)]">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--rail-ink)]">
              Belum ada permintaan tindakan.
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Klaster keluhan yang butuh arahan manajer akan tampil di sini.
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
            { label: "Menunggu", value: pendingCount.toString() },
            { label: "Risiko SLA", value: atRiskCount.toString() },
            {
              label: "Klaster",
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
                {atRiskCount} risiko SLA
              </span>
            }
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((isOpen) => !isOpen)}
            roleLabel="Manajer operasional"
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
                    Selesaikan klaster keluhan sekaligus, lalu beri agen hasil
                    operasional yang konsisten.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[430px]">
                  <MetricPill label="Klaster menunggu" value={pendingCount} />
                  <MetricPill label="Tiket terkait" value={18} />
                  <MetricPill label="Agen terdampak" value={11} />
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
        <span className="sr-only">Cari klaster</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          size={15}
        />
        <input
          className="h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Cari klaster..."
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
          label="Risiko SLA"
          onClick={() => setSlaRiskOnly(!slaRiskOnly)}
        />
        <ToggleButton
          active={assignedToMeOnly}
          label="Untuk saya"
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
              Tidak ada klaster yang cocok.
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Coba ubah kata kunci atau filter pencarian.
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
        <span>{cluster.complaintCount} keluhan</span>
        <span>{cluster.agentCount} agen</span>
        <span>{cluster.createdAt}</span>
        <span className="truncate">
          {cluster.assignedManagerName ?? "Belum ditugaskan"}
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
            {cluster.complaintCount} keluhan menunggu dari {cluster.agentCount}{" "}
            agen. Dibuat{" "}
            {cluster.createdAt.replace(/^Dibuat\s+/i, "").toLowerCase()}.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[420px]">
          <ActionButton
            icon={<UserCheck aria-hidden="true" size={15} />}
            label="Ambil tugas"
            onClick={onAssignToMe}
          />
          <ActionButton
            icon={<Clock3 aria-hidden="true" size={15} />}
            label="Tandai Diproses"
            onClick={onMarkInProgress}
          />
          <ActionButton
            icon={<CheckCircle2 aria-hidden="true" size={15} />}
            label="Selesaikan Tindakan"
            onClick={onComplete}
            tone="primary"
          />
          <ActionButton
            icon={<AlertCircle aria-hidden="true" size={15} />}
            label="Minta Info Tambahan"
            onClick={onRequestInfo}
          />
        </div>
      </div>
    </section>
  );
}

function ClusterSummaryCard({ cluster }: { cluster: ActionClusterDetail }) {
  return (
    <Panel title="Ringkasan Klaster">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryItem label="ID Klaster" value={cluster.id} />
        <SummaryItem label="Kategori" value={cluster.category} />
        <SummaryItem label="Subkategori" value={cluster.subCategory ?? "-"} />
        <SummaryItem
          label="Rute terdampak"
          value={cluster.affectedRoute ?? "Beberapa / belum diketahui"}
        />
        <SummaryItem
          label="Tanggal insiden"
          value={cluster.incidentDate ?? "Perlu verifikasi"}
        />
        <SummaryItem
          label="Rentang waktu"
          value={cluster.timeWindow ?? "Perlu verifikasi"}
        />
        <SummaryItem
          label="Manajer"
          value={cluster.assignedManagerName ?? "Belum ditugaskan"}
        />
        <SummaryItem
          label="Pengelompokan"
          value={confidenceLabel(cluster.groupingConfidence)}
        />
        <SummaryItem
          label="Verifikasi"
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
          {cluster.complaints.length} terkait
        </span>
      }
      title="Keluhan dalam Klaster"
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
                    via {sourceLabel(complaint.source)} - Agen{" "}
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
                  label="Lihat tiket"
                  onClick={() => undefined}
                  small
                />
                {complaint.sourceUrl ? (
                  <ActionButton
                    icon={<Link2 aria-hidden="true" size={14} />}
                    label="Buka URL sumber"
                    onClick={() => undefined}
                    small
                  />
                ) : null}
                <ActionButton
                  icon={<X aria-hidden="true" size={14} />}
                  label="Hapus dari klaster"
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
              Klaster ini belum memiliki keluhan terkait.
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Keluhan mungkin sudah dipisah, digabung, atau diarsipkan.
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
          Keyakinan {confidenceLabel(context.confidence).toLowerCase()}
        </Badge>
      }
      title="Konteks Rekomendasi Sistem"
    >
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg bg-[var(--background)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Dugaan penyebab
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--rail-ink)]">
            {context.possibleRootCause}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {context.detectedPattern}
          </p>
        </div>
        <div className="space-y-3">
          <SummaryItem
            label="Cakupan terdampak"
            value={context.affectedScope}
          />
          <SummaryItem
            label="Kebijakan yang disarankan"
            value={context.suggestedPolicy}
          />
          <SummaryItem
            label="Verifikasi yang dibutuhkan"
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
    <Panel title="Keputusan Manajer">
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="Jenis keputusan">
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
        <FormField label="Cakupan terdampak">
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
        <FormField label="Tim internal">
          <select
            className={inputClassName()}
            onChange={(event) => onChange({ internalTeam: event.target.value })}
            value={cluster.internalTeam ?? ""}
          >
            <option value="">Pilih tim</option>
            {internalTeamOptions.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status keputusan">
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
    <Panel title="Hasil Tindakan">
      <div className="grid gap-3">
        <FormField label="Ringkasan tindakan">
          <input
            className={inputClassName()}
            onChange={(event) =>
              onChange({ actionSummary: event.target.value })
            }
            placeholder="Sudah dikoordinasikan dengan tim operasional dan tim pengembalian dana."
            type="text"
            value={cluster.actionSummary ?? ""}
          />
        </FormField>
        <FormField label="Rincian hasil tindakan">
          <textarea
            className={`${inputClassName()} min-h-[150px] resize-none py-3 leading-6`}
            onChange={(event) => onChange({ actionResult: event.target.value })}
            placeholder="Tulis hasil operasional resmi di sini."
            value={cluster.actionResult ?? ""}
          />
        </FormField>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="URL referensi">
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
          <FormField label="Catatan tambahan manajer">
            <input
              className={inputClassName()}
              onChange={(event) =>
                onChange({ managerNotes: event.target.value })
              }
              placeholder="Catatan internal opsional"
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
      action={<Badge tone="green">Hanya beri tahu agen</Badge>}
      title="Pratinjau Tindak Lanjut Agen"
    >
      <FormField label="Pesan tindak lanjut untuk agen">
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
    <Panel title="Bukti dan Referensi">
      <div className="space-y-3">
        {cluster.referenceUrl ? (
          <ReferenceRow
            label="URL referensi manajer"
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
            Tambahkan URL referensi di formulir hasil tindakan agar bukti tetap
            terhubung dengan keputusan manajer.
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
    <Panel title="Riwayat Audit">
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
              Selesaikan tindakan dan beri tahu agen?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Tindakan ini akan memperbarui {cluster.complaintCount} tiket
              terkait dan memberi tahu {cluster.agentCount} agen. Tinjau
              keputusan dan hasil tindakan sebelum melanjutkan.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            className="h-11 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 text-sm font-semibold text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
            onClick={onCancel}
            type="button"
          >
            Batal
          </button>
          <button
            className="h-11 rounded-lg bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)]"
            onClick={onConfirm}
            type="button"
          >
            Selesaikan & Beri Tahu Agen
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
    : "Hasil tindakan manajer belum lengkap.";

  return `Arahan manajer selesai.\n\nHasil:\n${result}\n\nInstruksi untuk agen:\nKirim tindak lanjut akhir ke setiap pelanggan terkait berdasarkan hasil operasional yang sudah disetujui di atas.`;
}

function statusLabel(status: ClusterStatus) {
  const labels: Record<ClusterStatus, string> = {
    action_completed: "Selesai",
    assigned: "Ditugaskan",
    cancelled: "Dibatalkan",
    in_progress: "Diproses",
    merged: "Digabung",
    needs_info: "Butuh Info",
    pending: "Menunggu",
    resolved: "Selesai",
    waiting_internal_team: "Menunggu Tim",
  };

  return labels[status];
}

function priorityLabel(priority: ClusterPriority) {
  const labels: Record<ClusterPriority, string> = {
    high: "Prioritas Tinggi",
    low: "Prioritas Rendah",
    medium: "Prioritas Sedang",
    urgent: "Mendesak",
  };

  return labels[priority];
}

function confidenceLabel(confidence: string) {
  const labels: Record<string, string> = {
    high: "Tinggi",
    low: "Rendah",
    manual: "Pengelompokan manual",
    medium: "Sedang",
  };

  return labels[confidence] ?? confidence;
}

function verificationLabel(status: string) {
  const labels: Record<string, string> = {
    partially_verified: "Sebagian Terverifikasi",
    rejected: "Ditolak",
    unverified: "Belum Diverifikasi",
    verified: "Terverifikasi",
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
    web_form: "Form web",
  };

  return labels[source] ?? source;
}
