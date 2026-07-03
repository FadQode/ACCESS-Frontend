"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileText,
  Headphones,
  Link2,
  Lock,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  TicketCheck,
  UserRound,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import type { ZodError } from "zod";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { FeedbackDialog } from "@/core/components/feedback/feedback-dialog";
import { LoadingOverlay } from "@/core/components/feedback/loading-overlay";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useCreateQuickResponse } from "@/core/dashboard/hooks/use-create-quick-response";
import { useEscalateTicket } from "@/core/dashboard/hooks/use-escalate-ticket";
import { createQuickResponseSchema } from "@/core/dashboard/model/schemas/quick-response.schema";
import type {
  CreateQuickResponseResponse,
  QuickResponseOutcome,
} from "@/core/dashboard/model/types/quick-response.types";
import { mapQuickResponseToCreateRequest } from "@/core/dashboard/quick-response/quick-response.mapper";

type StepId = 1 | 2 | 3 | 4;
type ResponseTarget =
  | "public-reply"
  | "direct-message"
  | "app-review"
  | "internal-note";
type Tone = "formal" | "friendly" | "concise";
type OutcomeId = "resolved" | "ticket";
type CompletionState = "saved" | "resolved" | "follow-up";
type BuilderKey = "hear" | "empathize" | "apologize" | "takeAction";
type QuickResponseFieldErrors = Partial<
  Record<"complaintText" | "sourceUrl" | "finalResponse" | "permission", string>
>;
type FeedbackState = {
  description: string;
  title: string;
  variant: "success" | "error";
} | null;

interface Option {
  value: string;
  label: string;
}

interface SentenceOption {
  id: string;
  text: string;
}

interface BuilderOptions {
  hear: SentenceOption[];
  empathize: SentenceOption[];
  apologize: SentenceOption[];
  takeAction: SentenceOption[];
}

interface Scenario {
  key: string;
  label: string;
  insight: string;
  managerApprovalRequired: boolean;
  similarCase: {
    title: string;
    detail: string;
  };
  references: ReferenceItem[];
  builderOptions: BuilderOptions;
}

interface ReferenceItem {
  title: string;
  meta: string;
  linkLabel: string;
  tone: "green" | "amber" | "blue";
}

const sourceOptions: Option[] = [
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google-play", label: "Google Play" },
  { value: "app-store", label: "App Store" },
  { value: "other", label: "Lainnya" },
];

const defaultComplaint =
  "Kereta saya terlambat lebih dari 3 jam dari Surabaya ke Jakarta. Saya ada meeting penting dan tidak ada pemberitahuan sama sekali. Ini sangat mengecewakan!";

const genericOptions: BuilderOptions = {
  hear: [
    {
      id: "hear-generic-1",
      text: "Terima kasih sudah menyampaikan keluhan ini kepada kami.",
    },
    {
      id: "hear-generic-2",
      text: "Kami menerima laporan Kakak dan akan meninjau kendala yang disampaikan.",
    },
    {
      id: "hear-generic-3",
      text: "Kami memahami bahwa Kakak mengalami kendala pada layanan kami.",
    },
  ],
  empathize: [
    {
      id: "empathize-generic-1",
      text: "Kami memahami bahwa pengalaman ini tidak sesuai dengan harapan Kakak.",
    },
    {
      id: "empathize-generic-2",
      text: "Kami paham situasi seperti ini dapat membuat Kakak merasa tidak nyaman.",
    },
    {
      id: "empathize-generic-3",
      text: "Kami mengerti keluhan ini penting untuk segera ditindaklanjuti.",
    },
  ],
  apologize: [
    {
      id: "apologize-generic-1",
      text: "Mohon maaf atas ketidaknyamanan yang terjadi.",
    },
    {
      id: "apologize-generic-2",
      text: "Kami meminta maaf atas pengalaman yang belum sesuai harapan.",
    },
    {
      id: "apologize-generic-3",
      text: "Maaf atas kendala yang Kakak alami hari ini.",
    },
  ],
  takeAction: [
    {
      id: "action-generic-1",
      text: "Tim kami akan meninjau laporan ini dan memberikan tindak lanjut sesuai kebijakan yang berlaku.",
    },
    {
      id: "action-generic-2",
      text: "Kami akan bantu arahkan laporan ini ke tim terkait untuk pengecekan lebih lanjut.",
    },
    {
      id: "action-generic-3",
      text: "Silakan kirim detail melalui DM agar tim kami dapat membantu pengecekan lebih lanjut.",
    },
  ],
};

const scenarios: Record<string, Scenario> = {
  delay: {
    key: "delay",
    label: "Terlambat lama / tanpa notifikasi",
    insight:
      "Kemungkinan keluhan operasional. Balasan publik cukup mengakui kendala tanpa menjanjikan kompensasi.",
    managerApprovalRequired: true,
    similarCase: {
      title: "Keluhan serupa selesai - Maret 2026, Surabaya-Jakarta",
      detail:
        "Pengembalian dana penuh disetujui setelah tinjauan operasional. Selesai dalam 2 hari.",
    },
    references: [
      {
        title: "SOP - penanganan keterlambatan v2.1",
        meta: "Keterlambatan di atas 120 menit dapat ditinjau untuk pengembalian dana atau jadwal ulang setelah disetujui manajer.",
        linkLabel: "Lihat SOP",
        tone: "green",
      },
      {
        title: "Riwayat penyelesaian - keterlambatan Sby-Jkt, Mar 2026",
        meta: "Rute sama. Pengembalian dana penuh disetujui manajer setelah insiden dikonfirmasi.",
        linkLabel: "Lihat tiket #0712",
        tone: "amber",
      },
      {
        title: "Kebijakan pengembalian dana v3.2 - Bagian 4.2",
        meta: "Keputusan pengembalian dana atau jadwal ulang harus diverifikasi sebelum dikonfirmasi ke pelanggan.",
        linkLabel: "Lihat kebijakan",
        tone: "blue",
      },
    ],
    builderOptions: {
      ...genericOptions,
      hear: [
        {
          id: "hear-delay-1",
          text: "Kami menerima keluhan Kakak terkait keterlambatan perjalanan.",
        },
        {
          id: "hear-delay-2",
          text: "Terima kasih sudah menyampaikan kendala perjalanan ini kepada kami.",
        },
        {
          id: "hear-delay-3",
          text: "Kami memahami bahwa perjalanan Kakak mengalami keterlambatan yang cukup lama.",
        },
      ],
      takeAction: [
        {
          id: "action-delay-safe",
          text: "Berdasarkan kebijakan keterlambatan, kasus seperti ini perlu kami teruskan ke tim terkait untuk pengecekan dan persetujuan lebih lanjut.",
        },
        {
          id: "action-delay-team",
          text: "Kami akan bantu arahkan laporan ini ke tim operasional agar dapat ditinjau sesuai ketentuan yang berlaku.",
        },
        {
          id: "action-delay-dm",
          text: "Silakan lanjutkan melalui DM agar tim kami dapat membantu pengecekan tanpa membuka data pribadi di ruang publik.",
        },
      ],
    },
  },
  refund: {
    key: "refund",
    label: "Tindak lanjut pengembalian dana",
    insight:
      "Keluhan pengembalian dana perlu pengecekan status internal. Beri balasan awal yang aman dan buat tiket.",
    managerApprovalRequired: true,
    similarCase: {
      title: "Batch pengembalian dana serupa - April 2026",
      detail:
        "Selesai setelah tim keuangan mengonfirmasi status settlement payment gateway.",
    },
    references: [
      {
        title: "Kebijakan pengembalian dana v3.2",
        meta: "Status pengembalian dana harus diverifikasi sebelum estimasi waktu dibagikan.",
        linkLabel: "Lihat kebijakan",
        tone: "blue",
      },
      {
        title: "SOP settlement pembayaran",
        meta: "Kendala gateway membutuhkan konfirmasi tim keuangan.",
        linkLabel: "Lihat SOP",
        tone: "amber",
      },
    ],
    builderOptions: {
      ...genericOptions,
      hear: [
        {
          id: "hear-refund-1",
          text: "Kami menerima keluhan Kakak terkait proses pengembalian dana yang belum diterima.",
        },
        {
          id: "hear-refund-2",
          text: "Terima kasih sudah menghubungi kami mengenai status pengembalian dana Kakak.",
        },
        {
          id: "hear-refund-3",
          text: "Kami memahami bahwa Kakak membutuhkan kejelasan terkait proses pengembalian dana.",
        },
      ],
      takeAction: [
        {
          id: "action-refund-safe",
          text: "Kami akan teruskan laporan ini ke tim terkait untuk pengecekan status pengembalian dana dan tindak lanjut sesuai ketentuan.",
        },
        {
          id: "action-refund-dm",
          text: "Silakan lanjutkan melalui DM agar data pengajuan dapat dicek dengan aman oleh tim kami.",
        },
        {
          id: "action-refund-support",
          text: "Tim kami akan membantu pengecekan melalui kanal bantuan resmi tanpa meminta data pribadi di ruang publik.",
        },
      ],
    },
  },
  app: {
    key: "app",
    label: "Kendala akses aplikasi",
    insight:
      "Kemungkinan bisa dibantu dengan langkah awal yang aman, kecuali pelanggan melaporkan pembayaran atau booking hilang.",
    managerApprovalRequired: false,
    similarCase: {
      title: "Kendala login aplikasi serupa - Mei 2026",
      detail:
        "Selesai dengan refresh cache, pembaruan aplikasi, dan kontak bantuan resmi.",
    },
    references: [
      {
        title: "SOP kendala aplikasi",
        meta: "Gunakan langkah aman lebih dulu; arahkan kendala akun yang berlanjut ke kanal bantuan.",
        linkLabel: "Lihat SOP",
        tone: "green",
      },
    ],
    builderOptions: {
      ...genericOptions,
      hear: [
        {
          id: "hear-app-1",
          text: "Kami menerima keluhan Kakak terkait kendala pada aplikasi.",
        },
        {
          id: "hear-app-2",
          text: "Terima kasih sudah melaporkan kendala akses aplikasi ini.",
        },
        {
          id: "hear-app-3",
          text: "Kami memahami bahwa Kakak mengalami kesulitan menggunakan layanan aplikasi.",
        },
      ],
      takeAction: [
        {
          id: "action-app-safe",
          text: "Silakan coba tutup aplikasi sepenuhnya, bersihkan cache, lalu masuk kembali.",
        },
        {
          id: "action-app-support",
          text: "Jika masih belum berhasil, mohon hubungi kanal bantuan resmi dengan menyertakan detail perangkat dan akun.",
        },
        {
          id: "action-app-team",
          text: "Tim kami akan membantu pengecekan lebih lanjut jika kendala masih terjadi setelah langkah awal dicoba.",
        },
      ],
    },
  },
};

const genericScenario: Scenario = {
  key: "generic",
  label: "Keluhan pelanggan eksternal",
  insight:
    "Keluhan umum. Akui kendala secara aman dan jangan meminta data sensitif di ruang publik.",
  managerApprovalRequired: false,
  similarCase: {
    title: "Pola keluhan serupa ditemukan",
    detail:
      "Gunakan pengakuan awal yang aman dan pindahkan detail pribadi ke kanal bantuan resmi.",
  },
  references: [
    {
      title: "Panduan keamanan balasan eksternal",
      meta: "Jangan meminta data pribadi di balasan publik.",
      linkLabel: "Lihat panduan",
      tone: "blue",
    },
  ],
  builderOptions: genericOptions,
};

const builderSections: {
  key: BuilderKey;
  label: string;
  description: string;
}[] = [
  {
    key: "hear",
    label: "Tangkap Keluhan",
    description: "Sebutkan inti masalah yang dikeluhkan pelanggan.",
  },
  {
    key: "empathize",
    label: "Tunjukkan Empati",
    description: "Tunjukkan bahwa situasi pelanggan dipahami.",
  },
  {
    key: "apologize",
    label: "Minta Maaf",
    description: "Sampaikan maaf dengan jelas tanpa penjelasan berlebihan.",
  },
  {
    key: "takeAction",
    label: "Tindak Lanjut",
    description: "Gunakan langkah berikutnya yang aman untuk pelanggan.",
  },
];

export function QuickResponse() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const createQuickResponseMutation = useCreateQuickResponse();
  const escalateTicketMutation = useEscalateTicket();
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [source, setSource] = useState("twitter");
  const [username, setUsername] = useState("@sitinuraini");
  const [externalUrl, setExternalUrl] = useState("");
  const [rating, setRating] = useState("1");
  const [complaintText, setComplaintText] = useState(defaultComplaint);
  const [responseTarget, setResponseTarget] =
    useState<ResponseTarget>("public-reply");
  const tone: Tone = "formal";
  const [inputExpanded, setInputExpanded] = useState(true);
  const [inputDirty, setInputDirty] = useState(false);
  const [isBuildingResponse, setIsBuildingResponse] = useState(false);
  const [selectedHear, setSelectedHear] = useState("hear-delay-1");
  const [selectedEmpathize, setSelectedEmpathize] = useState(
    "empathize-generic-1",
  );
  const [selectedApologize, setSelectedApologize] = useState(
    "apologize-generic-1",
  );
  const [selectedTakeAction, setSelectedTakeAction] =
    useState("action-delay-safe");
  const [finalResponse, setFinalResponse] = useState(() =>
    buildResponseDraft(scenarios.delay.builderOptions, {
      hear: "hear-delay-1",
      empathize: "empathize-generic-1",
      apologize: "apologize-generic-1",
      takeAction: "action-delay-safe",
    }),
  );
  const [safeReply, setSafeReply] = useState(() =>
    buildSafeReply(scenarios.delay.builderOptions, {
      hear: "hear-delay-1",
      empathize: "empathize-generic-1",
      apologize: "apologize-generic-1",
    }),
  );
  const [managerApprovalRequired, setManagerApprovalRequired] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeId | null>(
    null,
  );
  const [completionState, setCompletionState] =
    useState<CompletionState | null>(null);
  const [copiedLabel, setCopiedLabel] = useState("");
  const [createdResult, setCreatedResult] =
    useState<CreateQuickResponseResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<QuickResponseFieldErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [activeScenario, setActiveScenario] = useState<Scenario>(
    scenarios.delay,
  );

  const sourceLabel = labelFor(sourceOptions, source);
  const isReviewSource = source === "google-play" || source === "app-store";
  const canGenerate = complaintText.trim().length > 0;
  const flowLocked = inputDirty;
  const isManager = sessionUser?.role === "manager";
  const isSubmitting =
    createQuickResponseMutation.isPending || escalateTicketMutation.isPending;

  const selectedMap = useMemo(
    () => ({
      hear: selectedHear,
      empathize: selectedEmpathize,
      apologize: selectedApologize,
      takeAction: selectedTakeAction,
    }),
    [selectedApologize, selectedEmpathize, selectedHear, selectedTakeAction],
  );

  const outcomeOptions = useMemo(
    () => [
      {
        id: "resolved" as const,
        title: "Salin & Selesaikan",
        description:
          "Salin balasan lengkap untuk pelanggan, lalu tandai keluhan selesai secara internal.",
        recommended: !managerApprovalRequired,
        icon: <CheckCircle2 aria-hidden="true" size={18} />,
      },
      {
        id: "ticket" as const,
        title: "Salin HEA & Minta Aksi",
        description:
          "Salin balasan HEA awal untuk pelanggan dan tandai kasus perlu tindak lanjut.",
        recommended: managerApprovalRequired,
        icon: <TicketCheck aria-hidden="true" size={18} />,
      },
    ],
    [managerApprovalRequired],
  );

  const handleSourceChange = (nextSource: string) => {
    setSource(nextSource);
    setFieldErrors((current) => ({ ...current, sourceUrl: undefined }));
    markInputDirty();

    if (nextSource === "google-play" || nextSource === "app-store") {
      setResponseTarget("app-review");
    } else {
      setResponseTarget("public-reply");
    }
  };

  const markInputDirty = () => {
    if (currentStep > 1) {
      setInputDirty(true);
      setCompletionState(null);
    }
  };

  const handleGenerate = () => {
    if (!canGenerate) {
      return;
    }

    setInputDirty(false);
    setInputExpanded(false);
    setCompletionState(null);
    setCreatedResult(null);
    setFieldErrors({});
    setCopiedLabel("");
    setCurrentStep(2);
    setIsBuildingResponse(true);

    window.setTimeout(() => {
      const scenario = getScenario(complaintText);
      const defaults = getDefaultSelections(scenario.builderOptions);
      const nextDraft = buildResponseDraft(scenario.builderOptions, defaults);
      const nextSafeReply = buildSafeReply(scenario.builderOptions, defaults);

      setActiveScenario(scenario);
      setManagerApprovalRequired(scenario.managerApprovalRequired);
      setSelectedHear(defaults.hear);
      setSelectedEmpathize(defaults.empathize);
      setSelectedApologize(defaults.apologize);
      setSelectedTakeAction(defaults.takeAction);
      setFinalResponse(applyTone(nextDraft, tone));
      setSafeReply(applyTone(nextSafeReply, tone));
      setIsBuildingResponse(false);
    }, 850);
  };

  const handleSelectSentence = (key: BuilderKey, optionId: string) => {
    const nextSelected = {
      ...selectedMap,
      [key]: optionId,
    };

    if (key === "hear") {
      setSelectedHear(optionId);
    }
    if (key === "empathize") {
      setSelectedEmpathize(optionId);
    }
    if (key === "apologize") {
      setSelectedApologize(optionId);
    }
    if (key === "takeAction") {
      setSelectedTakeAction(optionId);
    }

    const nextDraft = buildResponseDraft(
      activeScenario.builderOptions,
      nextSelected,
    );
    const nextSafeReply = buildSafeReply(
      activeScenario.builderOptions,
      nextSelected,
    );

    setFinalResponse(applyTone(nextDraft, tone));
    setSafeReply(applyTone(nextSafeReply, tone));
    setCompletionState(null);
    setCreatedResult(null);
    setFieldErrors((current) => ({ ...current, finalResponse: undefined }));
  };

  const handleCopyReview = async () => {
    const copied = await copyText(finalResponse);
    setCopiedLabel(copied ? "Balasan disalin" : "Gagal menyalin otomatis");
  };

  const handleOutcome = async (outcome: OutcomeId) => {
    if (isSubmitting) {
      return;
    }

    setSelectedOutcome(outcome);
    setCopiedLabel("");
    setFieldErrors({});
    setFeedback(null);

    if (isManager) {
      setFieldErrors({
        permission:
          "Akun manager tidak dapat membuat quick response dari halaman agent.",
      });
      return;
    }

    const payload = mapQuickResponseToCreateRequest({
      category: activeScenario.key,
      complaintText,
      finalResponse,
      outcome,
      responseTarget,
      safeReply,
      selectedApologize: findSentenceText(
        activeScenario.builderOptions.apologize,
        selectedApologize,
      ),
      selectedEmpathize: findSentenceText(
        activeScenario.builderOptions.empathize,
        selectedEmpathize,
      ),
      selectedHear: findSentenceText(
        activeScenario.builderOptions.hear,
        selectedHear,
      ),
      selectedTakeAction: findSentenceText(
        activeScenario.builderOptions.takeAction,
        selectedTakeAction,
      ),
      source,
      sourceHandle: username,
      sourceUrl: externalUrl,
      tone,
    });

    const parsedPayload = createQuickResponseSchema.safeParse(payload);

    if (!parsedPayload.success) {
      setFieldErrors(getQuickResponseFieldErrors(parsedPayload.error));
      setFeedback({
        description: "Periksa keluhan, URL sumber, dan balasan akhir.",
        title: "Form belum valid",
        variant: "error",
      });
      return;
    }

    const copied = await copyText(
      parsedPayload.data.response.finalResponse ?? "",
    );
    setCopiedLabel(copied ? "Balasan disalin" : "Gagal menyalin otomatis");

    try {
      const result = await createQuickResponseMutation.mutateAsync(
        parsedPayload.data,
      );
      let completedResult = result;

      if (result.quickResponseSession.outcome === "sent_hea_action") {
        if (!result.ticket?.id) {
          throw new Error(
            "Tiket follow-up belum tersedia, sehingga action request belum bisa dibuat.",
          );
        }

        const escalatedTicket = await escalateTicketMutation.mutateAsync(
          result.ticket.id,
        );

        completedResult = {
          ...result,
          ticket: {
            ...result.ticket,
            priority: escalatedTicket.priority ?? result.ticket.priority,
            status: escalatedTicket.status ?? result.ticket.status,
          },
        };
      }

      const completion = getCompletionState(
        completedResult.quickResponseSession.outcome,
      );

      setCreatedResult(completedResult);
      setCompletionState(completion);
      setFeedback({
        description: getSuccessDescription(completedResult),
        title: getSuccessTitle(completedResult.quickResponseSession.outcome),
        variant: "success",
      });
    } catch (error) {
      setFeedback({
        description: getSubmitErrorMessage(error),
        title:
          outcome === "ticket"
            ? "Request action gagal diproses"
            : "Quick response gagal disimpan",
        variant: "error",
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSource("twitter");
    setUsername("");
    setExternalUrl("");
    setRating("1");
    setComplaintText("");
    setResponseTarget("public-reply");
    setInputExpanded(true);
    setInputDirty(false);
    setSelectedOutcome(null);
    setCompletionState(null);
    setCreatedResult(null);
    setFieldErrors({});
    setFeedback(null);
    createQuickResponseMutation.reset();
    escalateTicketMutation.reset();
    setCopiedLabel("");
    setFinalResponse("");
    setSafeReply("");
    setActiveScenario(genericScenario);
    setManagerApprovalRequired(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <LoadingOverlay
        open={isSubmitting}
        title={
          escalateTicketMutation.isPending
            ? "Membuat action request..."
            : "Menyimpan quick response..."
        }
        description={
          escalateTicketMutation.isPending
            ? "Tiket follow-up sedang dikirim ke antrean manager."
            : "Keluhan dan sesi balasan sedang disimpan."
        }
      />
      <FeedbackDialog
        description={feedback?.description}
        onOpenChange={(open) => {
          if (!open) {
            setFeedback(null);
          }
        }}
        open={feedback !== null}
        title={feedback?.title ?? ""}
        variant={feedback?.variant ?? "info"}
      />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Alur", value: `Langkah ${currentStep}` },
            {
              label: "Tiket",
              value: completionState === "resolved" ? "Tidak" : "Jika perlu",
            },
            {
              label: "Risiko",
              value: managerApprovalRequired ? "Perlu persetujuan" : "Rendah",
            },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            controls={
              <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                <Sparkles
                  aria-hidden="true"
                  className="text-[var(--signal-amber)]"
                  size={15}
                />
                Prototipe alur
              </span>
            }
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Agen layanan"
          />

          <section className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
            <header className="border-b border-[var(--rail-border)] bg-[linear-gradient(135deg,#fbfcf7_0%,#edf4ef_52%,#dce9f3_100%)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                    External Complaint Handler
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)] sm:text-3xl">
                    Quick Response
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    Susun balasan eksternal yang aman, cek risikonya, lalu
                    tentukan apakah kasus bisa ditutup atau perlu tindak lanjut
                    internal.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-1 xl:min-w-[180px]">
                  <MetricPill label="Platform" value={sourceLabel} />
                </div>
              </div>
            </header>

            <div className="flex w-full flex-col gap-3 p-4 sm:p-5 lg:p-6">
              <Stepper currentStep={currentStep} />

              <StepCard
                isActive={currentStep === 1 || inputExpanded}
                isComplete={!inputExpanded && complaintText.trim().length > 0}
                meta={
                  complaintText.trim() ? sourceLabel : "Menunggu input keluhan"
                }
                number={1}
                title="Input"
                action={
                  !inputExpanded && complaintText.trim().length > 0 ? (
                    <button
                      className={secondaryButtonClass}
                      onClick={() => setInputExpanded(true)}
                      type="button"
                    >
                      <RefreshCcw aria-hidden="true" size={13} />
                      Ubah
                    </button>
                  ) : null
                }
              >
                {inputExpanded || currentStep === 1 ? (
                  <ComplaintInputForm
                    canGenerate={canGenerate}
                    complaintText={complaintText}
                    externalUrl={externalUrl}
                    fieldErrors={fieldErrors}
                    inputDirty={inputDirty}
                    isReviewSource={isReviewSource}
                    onCancel={() => {
                      setInputExpanded(false);
                      setInputDirty(false);
                    }}
                    onComplaintTextChange={(value) => {
                      setComplaintText(value);
                      markInputDirty();
                    }}
                    onExternalUrlChange={(value) => {
                      setExternalUrl(value);
                      markInputDirty();
                    }}
                    onGenerate={handleGenerate}
                    onRatingChange={(value) => {
                      setRating(value);
                      markInputDirty();
                    }}
                    onSourceChange={handleSourceChange}
                    onUsernameChange={(value) => {
                      setUsername(value);
                      markInputDirty();
                    }}
                    rating={rating}
                    source={source}
                    username={username}
                  />
                ) : (
                  <InputSummary
                    complaintText={complaintText}
                    source={sourceLabel}
                    username={username}
                  />
                )}
              </StepCard>

              <StepCard
                isActive={currentStep === 2 && !flowLocked}
                isComplete={currentStep > 2 && !flowLocked}
                isLocked={flowLocked || currentStep < 2}
                meta={
                  isBuildingResponse
                    ? "Menyusun rekomendasi"
                    : currentStep > 2
                      ? activeScenario.label
                      : "Buat dari input keluhan"
                }
                number={2}
                title="Build Response"
                action={
                  currentStep >= 2 && !flowLocked ? (
                    <ContextBadge>
                      {isBuildingResponse
                        ? "Memproses"
                        : "Kasus serupa ditemukan"}
                    </ContextBadge>
                  ) : null
                }
              >
                {isBuildingResponse ? (
                  <BuildResponseSkeleton />
                ) : (
                  <ResponseBuilder
                    flowLocked={flowLocked}
                    managerApprovalRequired={managerApprovalRequired}
                    onContinue={() => setCurrentStep(3)}
                    onSelectSentence={handleSelectSentence}
                    references={activeScenario.references}
                    scenario={activeScenario}
                    selectedMap={selectedMap}
                  />
                )}
              </StepCard>

              <StepCard
                isActive={currentStep === 3}
                isComplete={currentStep > 3 && !flowLocked}
                isLocked={currentStep < 3 || flowLocked}
                meta={
                  currentStep > 3 ? "Balasan ditinjau" : "Tinjau sebelum salin"
                }
                number={3}
                title="Review"
              >
                <ReviewStep
                  copiedLabel={copiedLabel}
                  finalResponseError={fieldErrors.finalResponse}
                  finalResponse={finalResponse}
                  managerApprovalRequired={managerApprovalRequired}
                  onBack={() => setCurrentStep(2)}
                  onChangeFinalResponse={setFinalResponse}
                  onContinue={() => setCurrentStep(4)}
                  onCopy={handleCopyReview}
                  source={sourceLabel}
                />
              </StepCard>

              <StepCard
                isActive={currentStep === 4}
                isLocked={currentStep < 4 || flowLocked}
                isComplete={completionState !== null}
                meta={
                  completionState
                    ? "Hasil dicatat"
                    : "Simpan, selesaikan, atau request action"
                }
                number={4}
                title="Outcome"
              >
                <OutcomeStep
                  createdResult={createdResult}
                  completionState={completionState}
                  finalResponse={finalResponse}
                  isManager={isManager}
                  isSubmitting={isSubmitting}
                  managerApprovalRequired={managerApprovalRequired}
                  onBack={() => setCurrentStep(3)}
                  onOutcome={handleOutcome}
                  onReset={handleReset}
                  options={outcomeOptions}
                  permissionError={fieldErrors.permission}
                  safeReply={safeReply}
                  selectedOutcome={selectedOutcome}
                  username={username}
                />
              </StepCard>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function ComplaintInputForm({
  canGenerate,
  complaintText,
  externalUrl,
  fieldErrors,
  inputDirty,
  isReviewSource,
  onCancel,
  onComplaintTextChange,
  onExternalUrlChange,
  onGenerate,
  onRatingChange,
  onSourceChange,
  onUsernameChange,
  rating,
  source,
  username,
}: {
  canGenerate: boolean;
  complaintText: string;
  externalUrl: string;
  fieldErrors: QuickResponseFieldErrors;
  inputDirty: boolean;
  isReviewSource: boolean;
  onCancel: () => void;
  onComplaintTextChange: (value: string) => void;
  onExternalUrlChange: (value: string) => void;
  onGenerate: () => void;
  onRatingChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  rating: string;
  source: string;
  username: string;
}) {
  return (
    <div className="space-y-4">
      {inputDirty ? (
        <WarningBanner>
          Keluhan berubah. Buat ulang balasan agar rekomendasi ikut diperbarui.
        </WarningBanner>
      ) : null}

      <FieldLabel label="Kanal sumber" required>
        <SegmentedButtons
          options={sourceOptions}
          value={source}
          onChange={onSourceChange}
        />
      </FieldLabel>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldLabel label="Username / handle" note="opsional">
          <div className="relative">
            <UserRound
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              size={15}
            />
            <input
              className={`${inputClass} pl-9`}
              onChange={(event) => onUsernameChange(event.target.value)}
              placeholder="@pelanggan"
              type="text"
              value={username}
            />
          </div>
        </FieldLabel>
        <FieldLabel label="Link eksternal" note="opsional">
          <div className="relative">
            <Link2
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              size={15}
            />
            <input
              className={`${inputClass} pl-9`}
              onChange={(event) => onExternalUrlChange(event.target.value)}
              placeholder="https://..."
              type="url"
              value={externalUrl}
            />
          </div>
          {fieldErrors.sourceUrl ? (
            <FieldError>{fieldErrors.sourceUrl}</FieldError>
          ) : null}
        </FieldLabel>
      </div>

      {isReviewSource ? (
        <FieldLabel label="Rating ulasan" required>
          <select
            className={inputClass}
            onChange={(event) => onRatingChange(event.target.value)}
            value={rating}
          >
            <option value="1">1 bintang</option>
            <option value="2">2 bintang</option>
            <option value="3">3 bintang</option>
            <option value="4">4 bintang</option>
            <option value="5">5 bintang</option>
          </select>
        </FieldLabel>
      ) : null}

      <FieldLabel label="Isi keluhan" required>
        <textarea
          className={`${textareaClass} min-h-[132px]`}
          onChange={(event) => onComplaintTextChange(event.target.value)}
          placeholder="Tempel keluhan eksternal di sini"
          value={complaintText}
        />
        <p className="mt-2 text-right text-[11px] font-medium text-[var(--text-muted)]">
          {complaintText.length} karakter
        </p>
        {fieldErrors.complaintText ? (
          <FieldError>{fieldErrors.complaintText}</FieldError>
        ) : null}
      </FieldLabel>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          className={secondaryButtonClass}
          onClick={onCancel}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={13} />
          Batal
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
          disabled={!canGenerate}
          onClick={onGenerate}
          type="button"
        >
          <Sparkles aria-hidden="true" size={15} />
          Buat Balasan
        </button>
      </div>
    </div>
  );
}

function InputSummary({
  complaintText,
  source,
  username,
}: {
  complaintText: string;
  source: string;
  username: string;
}) {
  return (
    <div>
      <p className="text-sm italic leading-6 text-[var(--text-muted)]">
        "{complaintText}"
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <ContextBadge>{source}</ContextBadge>
        {username ? <ContextBadge>{username}</ContextBadge> : null}
      </div>
    </div>
  );
}

function ResponseBuilder({
  flowLocked,
  managerApprovalRequired,
  onContinue,
  onSelectSentence,
  references,
  scenario,
  selectedMap,
}: {
  flowLocked: boolean;
  managerApprovalRequired: boolean;
  onContinue: () => void;
  onSelectSentence: (key: BuilderKey, optionId: string) => void;
  references: ReferenceItem[];
  scenario: Scenario;
  selectedMap: Record<BuilderKey, string>;
}) {
  return (
    <div className="space-y-4">
      {flowLocked ? (
        <WarningBanner>
          Rekomendasi sudah tidak sesuai. Buat ulang dari Langkah 1 sebelum
          lanjut.
        </WarningBanner>
      ) : null}

      <div className="flex items-start gap-3 rounded-lg border border-[var(--signal-green)] bg-[var(--signal-green-soft)] p-3">
        <SearchGlyph />
        <div>
          <p className="text-sm font-semibold text-[var(--signal-green-dark)]">
            {scenario.similarCase.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--signal-green-dark)]">
            {scenario.similarCase.detail}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {references.map((reference) => (
          <ReferenceChip key={reference.title}>{reference.title}</ReferenceChip>
        ))}
      </div>

      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          Penyusun balasan - pilih satu kalimat per bagian
        </p>
        <div className="space-y-4">
          {builderSections.map((section) =>
            section.key === "takeAction" ? (
              <TakeActionBlock
                disabled={flowLocked}
                key={section.key}
                managerApprovalRequired={managerApprovalRequired}
                onSelect={(optionId) =>
                  onSelectSentence("takeAction", optionId)
                }
                options={scenario.builderOptions.takeAction}
                references={references}
                selectedId={selectedMap.takeAction}
              />
            ) : (
              <SentenceChoiceGroup
                description={section.description}
                disabled={flowLocked}
                key={section.key}
                label={section.label}
                onSelect={(optionId) => onSelectSentence(section.key, optionId)}
                options={scenario.builderOptions[section.key]}
                selectedId={selectedMap[section.key]}
              />
            ),
          )}
        </div>
      </section>

      <button
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
        disabled={flowLocked}
        onClick={onContinue}
        type="button"
      >
        Review
        <ArrowRight aria-hidden="true" size={15} />
      </button>
    </div>
  );
}

function ReviewStep({
  copiedLabel,
  finalResponseError,
  finalResponse,
  managerApprovalRequired,
  onBack,
  onChangeFinalResponse,
  onContinue,
  onCopy,
  source,
}: {
  copiedLabel: string;
  finalResponseError?: string;
  finalResponse: string;
  managerApprovalRequired: boolean;
  onBack: () => void;
  onChangeFinalResponse: (value: string) => void;
  onContinue: () => void;
  onCopy: () => void;
  source: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex min-h-8 w-fit items-center gap-2 rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-3 text-xs font-semibold text-[var(--signal-blue)]">
          <MessageSquareText aria-hidden="true" size={14} />
          Disesuaikan untuk {source}
        </span>
        <button className={secondaryButtonClass} onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={13} />
          Kembali ke penyusun
        </button>
      </div>

      <section className="rounded-lg border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--signal-amber-dark)]">
          <ShieldCheck aria-hidden="true" size={14} />
          Pemeriksaan keamanan
        </div>
        <div className="space-y-2">
          <SafetyItem>
            Hindari meminta kode booking di balasan publik. Arahkan data pribadi
            ke DM atau kanal bantuan resmi.
          </SafetyItem>
          {managerApprovalRequired ? (
            <SafetyItem>
              Jangan langsung mengonfirmasi pengembalian dana, jadwal ulang,
              atau kompensasi. Persetujuan diperlukan lebih dulu.
            </SafetyItem>
          ) : null}
          <SafetyItem>
            Jangan menyebut nama SOP internal, ID tiket lama, atau alur
            persetujuan kepada pelanggan.
          </SafetyItem>
        </div>
      </section>

      <FieldLabel label="Balasan akhir" note="boleh diedit" required>
        <textarea
          className={`${textareaClass} min-h-[180px] border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]`}
          onChange={(event) => onChangeFinalResponse(event.target.value)}
          value={finalResponse}
        />
        {finalResponseError ? (
          <FieldError>{finalResponseError}</FieldError>
        ) : null}
      </FieldLabel>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button className={secondaryButtonClass} onClick={onCopy} type="button">
          <Copy aria-hidden="true" size={13} />
          {copiedLabel || "Salin balasan"}
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)]"
          onClick={onContinue}
          type="button"
        >
          Outcome
          <ArrowRight aria-hidden="true" size={15} />
        </button>
      </div>
    </div>
  );
}

function OutcomeStep({
  createdResult,
  completionState,
  finalResponse,
  isManager,
  isSubmitting,
  managerApprovalRequired,
  onBack,
  onOutcome,
  onReset,
  options,
  permissionError,
  safeReply,
  selectedOutcome,
  username,
}: {
  createdResult: CreateQuickResponseResponse | null;
  completionState: CompletionState | null;
  finalResponse: string;
  isManager: boolean;
  isSubmitting: boolean;
  managerApprovalRequired: boolean;
  onBack: () => void;
  onOutcome: (outcome: OutcomeId) => void;
  onReset: () => void;
  options: {
    id: OutcomeId;
    title: string;
    description: string;
    recommended: boolean;
    icon: ReactNode;
  }[];
  permissionError?: string;
  safeReply: string;
  selectedOutcome: OutcomeId | null;
  username: string;
}) {
  if (completionState && createdResult) {
    return (
      <CompletionStateView
        completionState={completionState}
        result={createdResult}
        username={username}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--rail-ink)]">
          Outcome
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
          Apakah keluhan ini bisa selesai sekarang, atau perlu tindak lanjut
          internal?
        </p>
      </div>

      {managerApprovalRequired ? (
        <WarningBanner>
          Kasus ini perlu persetujuan manajer. Rekomendasi: salin balasan awal
          dan buat tiket.
        </WarningBanner>
      ) : null}
      {isManager ? (
        <WarningBanner>
          Akun manager hanya dapat meninjau. Login sebagai agent atau admin
          untuk menyimpan quick response.
        </WarningBanner>
      ) : null}
      {permissionError ? <FieldError>{permissionError}</FieldError> : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {options.map((option) => (
          <button
            className={`min-h-[154px] rounded-lg border p-4 text-left transition ${
              selectedOutcome === option.id
                ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)]"
                : option.recommended
                  ? "border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] hover:border-[var(--signal-blue)]"
                  : "border-[var(--rail-border)] bg-[var(--surface-panel)] hover:border-[var(--signal-blue)] hover:bg-[var(--background)]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            key={option.id}
            disabled={isManager || isSubmitting}
            onClick={() => onOutcome(option.id)}
            type="button"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--signal-blue)]">
              {option.icon}
            </span>
            <span className="mt-3 block text-sm font-semibold text-[var(--rail-ink)]">
              {option.title}
            </span>
            <span className="mt-2 block text-xs leading-5 text-[var(--text-muted)]">
              {option.description}
            </span>
            {option.recommended ? (
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--signal-green-dark)]">
                <Star aria-hidden="true" size={12} />
                Direkomendasikan
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PreviewBox title="Balasan akhir lengkap" value={finalResponse} />
        <PreviewBox
          title="Balasan awal untuk kasus lanjutan"
          value={safeReply}
        />
      </div>

      <div className="text-center">
        <button className={secondaryButtonClass} onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={13} />
          Kembali ke tinjauan
        </button>
      </div>
    </div>
  );
}

function CompletionStateView({
  completionState,
  onReset,
  result,
  username,
}: {
  completionState: CompletionState;
  onReset: () => void;
  result: CreateQuickResponseResponse;
  username: string;
}) {
  const complaintReference =
    result.complaint.referenceNo ?? result.complaint.id;
  const sessionReference = result.quickResponseSession.id;
  const ticketReference = result.ticket?.id;
  const content = {
    saved: {
      icon: <ClipboardCheck aria-hidden="true" size={25} />,
      title: "Quick response tersimpan",
      body: "Balasan sudah disalin untuk dikirim manual ke pelanggan. Keluhan dan sesi quick response sudah tersimpan tanpa menutup keluhan.",
      reference: `Keluhan #${complaintReference}`,
      tone: "green",
    },
    resolved: {
      icon: <ClipboardCheck aria-hidden="true" size={25} />,
      title: "Keluhan tersimpan dan selesai",
      body: "Balasan akhir sudah disalin untuk dikirim manual ke pelanggan. Keluhan dan sesi quick response sudah disimpan oleh backend.",
      reference: `Keluhan #${complaintReference}`,
      tone: "green",
    },
    "follow-up": {
      icon: <TicketCheck aria-hidden="true" size={25} />,
      title: ticketReference
        ? "Follow-up tersimpan dan action request dibuat"
        : "Follow-up tersimpan",
      body: "Balasan HEA awal sudah disalin untuk dikirim manual ke pelanggan. Ticket follow-up sudah dikirim ke antrean manager.",
      reference: ticketReference
        ? `Tiket #${ticketReference}`
        : `Keluhan #${complaintReference}`,
      tone: "blue",
    },
  }[completionState];

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          content.tone === "green"
            ? "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
            : content.tone === "red"
              ? "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]"
              : "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
        }`}
      >
        {content.icon}
      </span>
      <h3 className="text-base font-semibold text-[var(--rail-ink)]">
        {content.title}
      </h3>
      <p className="max-w-lg text-sm leading-6 text-[var(--text-muted)]">
        {content.body}
      </p>
      {username ? (
        <p className="text-xs text-[var(--text-tertiary)]">
          Handle eksternal: {username}
        </p>
      ) : null}
      <span className="rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-4 py-2 text-xs font-semibold text-[var(--signal-blue)]">
        {content.reference}
      </span>
      <div className="grid w-full max-w-xl gap-2 text-left sm:grid-cols-2">
        <ResultMeta label="Status keluhan" value={result.complaint.status} />
        <ResultMeta
          label="Outcome"
          value={result.quickResponseSession.outcome}
        />
        <ResultMeta label="Sesi QR" value={sessionReference} />
        {result.ticket ? (
          <ResultMeta label="Status tiket" value={result.ticket.status} />
        ) : null}
      </div>
      <button className={secondaryButtonClass} onClick={onReset} type="button">
        Mulai keluhan baru
      </button>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: StepId }) {
  const steps = [
    { id: 1, label: "Input" },
    { id: 2, label: "Build Response" },
    { id: 3, label: "Review" },
    { id: 4, label: "Outcome" },
  ];

  return (
    <nav
      aria-label="Quick response flow"
      className="mb-2 flex items-center overflow-x-auto pb-1"
    >
      {steps.map((step, index) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div className="flex min-w-fit flex-1 items-center" key={step.id}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                  isDone
                    ? "border-[var(--signal-blue)] bg-[var(--signal-blue)] text-white"
                    : isActive
                      ? "border-[var(--signal-blue)] bg-[var(--surface-panel)] text-[var(--signal-blue)]"
                      : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-tertiary)]"
                }`}
              >
                {isDone ? <Check aria-hidden="true" size={13} /> : step.id}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isActive
                    ? "text-[var(--signal-blue)]"
                    : isDone
                      ? "text-[var(--text-muted)]"
                      : "text-[var(--text-tertiary)]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span
                className={`mx-3 h-px flex-1 ${
                  isDone ? "bg-[var(--signal-blue)]" : "bg-[var(--rail-border)]"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function StepCard({
  action,
  children,
  isActive,
  isComplete = false,
  isLocked = false,
  meta,
  number,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  isActive: boolean;
  isComplete?: boolean;
  isLocked?: boolean;
  meta?: string;
  number: StepId;
  title: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border bg-[var(--surface-panel)] transition ${
        isActive
          ? "border-[var(--signal-blue)] shadow-[var(--shadow-soft)]"
          : "border-[var(--rail-border)]"
      } ${isLocked ? "opacity-50" : ""}`}
    >
      <header
        className={`flex min-h-12 items-center gap-3 px-4 py-3 ${
          isActive ? "border-b border-[var(--rail-border)]" : ""
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isComplete
              ? "bg-[var(--signal-blue)] text-white"
              : "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
          }`}
        >
          {isComplete ? <Check aria-hidden="true" size={13} /> : number}
        </span>
        <h2 className="min-w-0 flex-1 text-sm font-semibold text-[var(--rail-ink)]">
          {title}
        </h2>
        {meta ? (
          <span className="hidden max-w-[320px] truncate text-right text-xs font-medium text-[var(--text-muted)] md:block">
            {meta}
          </span>
        ) : null}
        {action}
      </header>
      {isActive ? (
        <div className={isLocked ? "pointer-events-none p-4" : "p-4"}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

const skeletonRows = ["hear", "empathize", "apologize", "take-action"];
const skeletonReferences = ["sop", "past-resolution", "policy"];

function BuildResponseSkeleton() {
  return (
    <output
      aria-busy="true"
      aria-label="Memproses rekomendasi balasan"
      className="space-y-4"
    >
      <div className="flex items-start gap-3 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
        <span className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-[var(--surface-muted)]" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {skeletonReferences.map((item) => (
          <span
            className="h-7 w-36 animate-pulse rounded-full bg-[var(--signal-blue-soft)]"
            key={item}
          />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {skeletonRows.map((item) => (
          <section
            className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3"
            key={item}
          >
            <div className="mb-3 h-4 w-32 animate-pulse rounded-full bg-[var(--surface-muted)]" />
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
              <div className="h-10 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
              <div className="h-10 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] p-3 text-xs font-semibold text-[var(--signal-amber-dark)]">
        Memeriksa keluhan serupa, referensi SOP, peringatan kebijakan, dan opsi
        balasan yang aman...
      </div>
    </output>
  );
}

function SentenceChoiceGroup({
  description,
  disabled,
  label,
  onSelect,
  options,
  selectedId,
}: {
  description: string;
  disabled: boolean;
  label: string;
  onSelect: (optionId: string) => void;
  options: SentenceOption[];
  selectedId: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-[var(--rail-ink)]">{label}</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
      <div className="mt-3 space-y-2">
        {options.map((option) => (
          <button
            className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm leading-6 transition ${
              selectedId === option.id
                ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--rail-ink)]"
                : "border-[var(--rail-border)] bg-[var(--background)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--rail-ink)]"
            }`}
            disabled={disabled}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            {option.text}
          </button>
        ))}
      </div>
    </section>
  );
}

function TakeActionBlock({
  disabled,
  managerApprovalRequired,
  onSelect,
  options,
  references,
  selectedId,
}: {
  disabled: boolean;
  managerApprovalRequired: boolean;
  onSelect: (optionId: string) => void;
  options: SentenceOption[];
  references: ReferenceItem[];
  selectedId: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
        Tindak Lanjut
      </h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Pisahkan kalimat untuk pelanggan dari tindakan internal yang dibutuhkan.
      </p>
      <div className="mt-3 overflow-hidden rounded-xl border border-[var(--signal-amber)]">
        <div className="flex items-center gap-2 border-b border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] px-3 py-2">
          <Sparkles
            aria-hidden="true"
            className="text-[var(--signal-amber-dark)]"
            size={15}
          />
          <p className="flex-1 text-xs font-semibold text-[var(--signal-amber-dark)]">
            Tindakan yang bisa disampaikan ke pelanggan
          </p>
          {managerApprovalRequired ? (
            <span className="rounded-full border border-[var(--signal-amber)] bg-[var(--surface-panel)] px-2 py-1 text-[10px] font-semibold text-[var(--signal-amber-dark)]">
              Perlu persetujuan
            </span>
          ) : null}
        </div>
        <div className="space-y-3 p-3">
          <div className="space-y-2">
            {options.map((option) => (
              <button
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm leading-6 transition ${
                  selectedId === option.id
                    ? "border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]"
                    : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-amber)] hover:text-[var(--rail-ink)]"
                }`}
                disabled={disabled}
                key={option.id}
                onClick={() => onSelect(option.id)}
                type="button"
              >
                {option.text}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              <Lock aria-hidden="true" size={13} />
              Internal - tidak ditampilkan ke pelanggan
            </div>
            <div className="space-y-3">
              {references.map((reference) => (
                <ReferenceRow key={reference.title} reference={reference} />
              ))}
            </div>
            {managerApprovalRequired ? (
              <div className="mt-3 flex gap-2 rounded-lg border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] p-3 text-xs leading-5 text-[var(--signal-amber-dark)]">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                  size={14}
                />
                <span>
                  Perlu persetujuan manajer. Jangan langsung mengonfirmasi
                  pengembalian dana, kompensasi, atau jadwal ulang. Buat tiket
                  tindak lanjut jika kasus belum selesai.
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReferenceRow({ reference }: { reference: ReferenceItem }) {
  const toneClass = {
    amber: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    blue: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    green: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
  }[reference.tone];

  return (
    <div className="flex items-start gap-3 border-b border-[var(--rail-border)] pb-3 last:border-b-0 last:pb-0">
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}
      >
        <FileText aria-hidden="true" size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--rail-ink)]">
          {reference.title}
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
          {reference.meta}
        </p>
        <button
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--signal-blue)]"
          type="button"
        >
          <ExternalLink aria-hidden="true" size={12} />
          {reference.linkLabel}
        </button>
      </div>
    </div>
  );
}

function PreviewBox({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <h4 className="text-xs font-semibold text-[var(--rail-ink)]">{title}</h4>
      <p className="mt-2 line-clamp-5 text-xs leading-5 text-[var(--text-muted)]">
        {value}
      </p>
    </section>
  );
}

function SafetyItem({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 text-xs leading-5 text-[var(--signal-amber-dark)]">
      <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={13} />
      <span>{children}</span>
    </p>
  );
}

function FieldLabel({
  children,
  label,
  note,
  required = false,
}: {
  children: ReactNode;
  label: string;
  note?: string;
  required?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--rail-ink)]">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-[var(--signal-red)]">
            *
          </span>
        ) : null}
        {note ? (
          <span className="font-normal text-[var(--text-tertiary)]">
            {" "}
            ({note})
          </span>
        ) : null}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-xs font-medium text-[var(--signal-red-dark)]">
      {children}
    </p>
  );
}

function ResultMeta({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-[var(--rail-ink)]">
        {value ?? "-"}
      </p>
    </div>
  );
}

function SegmentedButtons({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: Option[];
  value: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold transition ${
            value === option.value
              ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
              : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--rail-ink)]"
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--rail-border)] bg-[rgba(251,252,247,0.72)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function ContextBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
      {children}
    </span>
  );
}

function ReferenceChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
      <FileText aria-hidden="true" size={12} />
      {children}
    </span>
  );
}

function WarningBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] p-3 text-xs leading-5 text-[var(--signal-amber-dark)]">
      <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={14} />
      <span>{children}</span>
    </div>
  );
}

function SearchGlyph() {
  return (
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-panel)] text-[var(--signal-green-dark)]">
      <Headphones aria-hidden="true" size={18} />
    </span>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";

const textareaClass =
  "w-full resize-none rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-3 text-sm leading-6 text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";

const secondaryButtonClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]";

function getScenario(text: string) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("delay") ||
    lowerText.includes("terlambat") ||
    lowerText.includes("keterlambatan")
  ) {
    return scenarios.delay;
  }

  if (
    lowerText.includes("refund") ||
    lowerText.includes("pengembalian dana") ||
    lowerText.includes("uang kembali")
  ) {
    return scenarios.refund;
  }

  if (
    lowerText.includes("login") ||
    lowerText.includes("masuk") ||
    lowerText.includes("aplikasi") ||
    lowerText.includes("password") ||
    lowerText.includes("otp")
  ) {
    return scenarios.app;
  }

  return genericScenario;
}

function getDefaultSelections(options: BuilderOptions) {
  return {
    hear: options.hear[0]?.id ?? "",
    empathize: options.empathize[0]?.id ?? "",
    apologize: options.apologize[0]?.id ?? "",
    takeAction: options.takeAction[0]?.id ?? "",
  };
}

function buildResponseDraft(
  options: BuilderOptions,
  selected: Record<BuilderKey, string>,
) {
  return builderSections
    .map((section) => {
      return options[section.key].find(
        (option) => option.id === selected[section.key],
      )?.text;
    })
    .filter(Boolean)
    .join(" ");
}

function buildSafeReply(
  options: BuilderOptions,
  selected: Partial<Record<BuilderKey, string>>,
) {
  const safeAction =
    "Laporan Kakak akan kami teruskan ke tim terkait untuk pengecekan dan tindak lanjut lebih lanjut.";
  const parts = (["hear", "empathize", "apologize"] as BuilderKey[])
    .map((section) => {
      return options[section].find((option) => option.id === selected[section])
        ?.text;
    })
    .filter(Boolean);

  return [...parts, safeAction].join(" ");
}

function applyTone(draft: string, tone: Tone) {
  if (tone === "concise") {
    return draft
      .replace("Terima kasih sudah menyampaikan keluhan ini kepada kami. ", "")
      .replace(
        "Kami menerima keluhan Kakak terkait ",
        "Kami terima laporan terkait ",
      );
  }

  if (tone === "friendly") {
    return `${draft} Terima kasih sudah bersabar ya, Kak.`;
  }

  return draft;
}

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function findSentenceText(options: SentenceOption[], selectedId: string) {
  return options.find((option) => option.id === selectedId)?.text ?? null;
}

function getCompletionState(outcome: QuickResponseOutcome): CompletionState {
  if (outcome === "copy_only") {
    return "saved";
  }

  if (outcome === "sent_hea_action") {
    return "follow-up";
  }

  return "resolved";
}

function getSuccessTitle(outcome: QuickResponseOutcome) {
  if (outcome === "copy_only") {
    return "Quick response saved";
  }

  if (outcome === "sent_hea_action") {
    return "Follow-up created";
  }

  return "Complaint resolved";
}

function getSuccessDescription(result: CreateQuickResponseResponse) {
  if (result.quickResponseSession.outcome === "sent_hea_action") {
    return "Keluhan, quick response, tiket follow-up, dan action request manager sudah dibuat.";
  }

  if (result.quickResponseSession.outcome === "sent_resolved") {
    return "Keluhan sudah disimpan dan ditandai selesai.";
  }

  if (result.quickResponseSession.outcome === "copy_only") {
    return "Keluhan dan sesi quick response sudah disimpan.";
  }

  return "Keluhan sudah disimpan dan ditandai perlu tindak lanjut.";
}

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Gagal menyimpan quick response. Periksa form lalu coba lagi.";
}

function getQuickResponseFieldErrors(error: ZodError) {
  const errors: QuickResponseFieldErrors = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");

    if (path === "complaint.complaintText") {
      errors.complaintText = issue.message;
    }

    if (path === "complaint.sourceUrl") {
      errors.sourceUrl = issue.message;
    }

    if (path === "response.finalResponse") {
      errors.finalResponse = issue.message;
    }
  }

  return errors;
}

async function copyText(text: string) {
  if (!text.trim()) {
    return false;
  }

  try {
    await navigator.clipboard?.writeText(text);
    return true;
  } catch {
    return copyTextWithTextarea(text);
  }
}

function copyTextWithTextarea(text: string) {
  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
