"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Info,
  Link2,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
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
import { useQuickResponsePreview } from "@/core/dashboard/hooks/use-quick-response-preview";
import { createQuickResponseSchema } from "@/core/dashboard/model/schemas/quick-response.schema";
import type {
  CreateQuickResponseResponse,
  QuickResponseCategory,
  QuickResponseOutcome,
  QuickResponsePreviewData,
  QuickResponseSuggestionSource,
  RelevantReference,
  SimilarResolvedCase,
} from "@/core/dashboard/model/types/quick-response.types";
import {
  mapQuickResponseToCreateRequest,
  targetToBackendMap,
} from "@/core/dashboard/quick-response/quick-response.mapper";
import { useReferenceFileUrl } from "@/core/reference/hooks/use-reference-file-url";
import {
  closeReferenceWindow,
  navigateReferenceWindow,
  openPendingReferenceWindow,
} from "@/core/reference/ui/open-reference-window";

type StepId = 1 | 2 | 3 | 4;
type ResponseTarget =
  | "public-reply"
  | "direct-message"
  | "app-review"
  | "internal-note";
type OutcomeId = "resolved" | "ticket";
type CompletionState = "saved" | "resolved" | "follow-up";
type BuilderKey = "hear" | "empathize" | "apologize" | "takeAction";
type QuickResponseFieldErrors = Partial<
  Record<
    "category" | "complaintText" | "sourceUrl" | "finalResponse" | "permission",
    string
  >
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

type PreviewContext = {
  relevantReferences: RelevantReference[];
  similarResolvedCases: SimilarResolvedCase[];
};

const sourceOptions: Option[] = [
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google-play", label: "Google Play" },
  { value: "app-store", label: "App Store" },
  { value: "other", label: "Lainnya" },
];

const categoryOptions: Option[] = [
  { value: "ticket_booking", label: "Tiket / Booking" },
  { value: "app_error", label: "Aplikasi Error / Lemot" },
  { value: "account", label: "Login / OTP / Akun" },
  { value: "payment", label: "Pembayaran" },
  { value: "app_update", label: "Update Aplikasi" },
  { value: "no_response_cs", label: "CS Tidak Merespons" },
  { value: "refund_cancel", label: "Refund / Pembatalan" },
  { value: "queue_problem", label: "Antrian / Promo" },
  { value: "lost_item", label: "Barang Tertinggal" },
  { value: "facility", label: "Fasilitas" },
  { value: "other", label: "Lainnya" },
];

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

const emptyPreviewContext: PreviewContext = {
  relevantReferences: [],
  similarResolvedCases: [],
};

export function QuickResponse() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const createQuickResponseMutation = useCreateQuickResponse();
  const escalateTicketMutation = useEscalateTicket();
  const fileUrlMutation = useReferenceFileUrl();
  const previewMutation = useQuickResponsePreview();
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [source, setSource] = useState("twitter");
  const [username, setUsername] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [rating, setRating] = useState("1");
  const [complaintText, setComplaintText] = useState("");
  const [category, setCategory] = useState("");
  const [responseTarget, setResponseTarget] =
    useState<ResponseTarget>("public-reply");
  const responseTone = "calm";
  const [inputExpanded, setInputExpanded] = useState(true);
  const [inputDirty, setInputDirty] = useState(false);
  const [builderOptions, setBuilderOptions] = useState<BuilderOptions | null>(
    null,
  );
  const [suggestionSource, setSuggestionSource] =
    useState<QuickResponseSuggestionSource | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [selectedHear, setSelectedHear] = useState("");
  const [selectedEmpathize, setSelectedEmpathize] = useState("");
  const [selectedApologize, setSelectedApologize] = useState("");
  const [selectedTakeAction, setSelectedTakeAction] = useState("");
  const [finalResponse, setFinalResponse] = useState("");
  const [safeReply, setSafeReply] = useState("");
  const [isFinalResponseManuallyEdited, setIsFinalResponseManuallyEdited] =
    useState(false);
  const [manualPreservedNotice, setManualPreservedNotice] = useState("");
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
  const [openingReferenceId, setOpeningReferenceId] = useState<string | null>(
    null,
  );
  const [previewContext, setPreviewContext] =
    useState<PreviewContext>(emptyPreviewContext);
  const [referenceOpenError, setReferenceOpenError] = useState("");

  const sourceLabel = labelFor(sourceOptions, source);
  const categoryLabel = category
    ? labelFor(categoryOptions, category)
    : "Belum dipilih";
  const isReviewSource = source === "google-play" || source === "app-store";
  const isManager = sessionUser?.role === "manager";
  const isGenerating = previewMutation.isPending;
  const canGenerate =
    complaintText.trim().length > 0 && !isGenerating && !isManager;
  const flowLocked = inputDirty;
  const isSubmitting =
    createQuickResponseMutation.isPending || escalateTicketMutation.isPending;
  const managerApprovalRequired = false;
  const hasPreviewSuggestions = builderOptions !== null;

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
        icon: <CheckCircle2 aria-hidden="true" size={18} />,
      },
      {
        id: "ticket" as const,
        title: "Salin HEA & Minta Aksi",
        description:
          "Salin balasan HEA awal untuk pelanggan dan tandai kasus perlu tindak lanjut.",
        icon: <TicketCheck aria-hidden="true" size={18} />,
      },
    ],
    [],
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

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setFieldErrors((current) => ({ ...current, category: undefined }));
    markInputDirty();
  };

  const markInputDirty = () => {
    if (currentStep > 1) {
      setInputDirty(true);
      setCompletionState(null);
    }
  };

  const handleGenerate = async () => {
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
    setPreviewError("");
    setPreviewContext(emptyPreviewContext);
    setReferenceOpenError("");
    setManualPreservedNotice("");

    try {
      const preview = await previewMutation.mutateAsync({
        complaintText,
        ...(category ? { category: category as QuickResponseCategory } : {}),
        responseTarget: targetToBackendMap[responseTarget],
        responseTone,
      });
      const nextOptions = createBuilderOptions(preview);
      const defaults = getDefaultSelections(nextOptions);
      const nextDraft = buildFinalResponse(defaults);

      setBuilderOptions(nextOptions);
      setPreviewContext({
        relevantReferences: preview.relevantReferences,
        similarResolvedCases: preview.similarResolvedCases,
      });
      setSuggestionSource(preview.suggestionSource);
      setSelectedHear(defaults.hear);
      setSelectedEmpathize(defaults.empathize);
      setSelectedApologize(defaults.apologize);
      setSelectedTakeAction(defaults.takeAction);
      setSafeReply(buildSafeReply(defaults));

      if (isFinalResponseManuallyEdited) {
        setManualPreservedNotice("Final response manual tetap dipertahankan.");
      } else {
        setFinalResponse(nextDraft);
      }
    } catch (error) {
      setBuilderOptions(null);
      setPreviewContext(emptyPreviewContext);
      setSuggestionSource(null);
      setPreviewError(getPreviewErrorMessage(error));
    }
  };

  const handleSelectSentence = (key: BuilderKey, optionText: string) => {
    const nextSelected = {
      ...selectedMap,
      [key]: optionText,
    };

    if (key === "hear") {
      setSelectedHear(optionText);
    }
    if (key === "empathize") {
      setSelectedEmpathize(optionText);
    }
    if (key === "apologize") {
      setSelectedApologize(optionText);
    }
    if (key === "takeAction") {
      setSelectedTakeAction(optionText);
    }

    const nextDraft = buildFinalResponse(nextSelected);

    if (!isFinalResponseManuallyEdited) {
      setFinalResponse(nextDraft);
    }

    setSafeReply(buildSafeReply(nextSelected));
    setCompletionState(null);
    setCreatedResult(null);
    setFieldErrors((current) => ({ ...current, finalResponse: undefined }));
  };

  const handleFinalResponseChange = (value: string) => {
    setFinalResponse(value);
    setIsFinalResponseManuallyEdited(true);
    setFieldErrors((current) => ({ ...current, finalResponse: undefined }));
  };

  const handleUpdateFinalResponseFromSelected = () => {
    setFinalResponse(buildFinalResponse(selectedMap));
    setIsFinalResponseManuallyEdited(false);
    setManualPreservedNotice("");
    setFieldErrors((current) => ({ ...current, finalResponse: undefined }));
  };

  const handleOpenReferenceFile = async (referenceId: string) => {
    setReferenceOpenError("");
    setOpeningReferenceId(referenceId);
    const pendingWindow = openPendingReferenceWindow();

    try {
      const fileUrl = await fileUrlMutation.mutateAsync(referenceId);
      if (!navigateReferenceWindow(pendingWindow, fileUrl.signedUrl)) {
        setReferenceOpenError(
          "Browser memblokir tab referensi. Izinkan pop-up lalu coba lagi.",
        );
      }
    } catch {
      closeReferenceWindow(pendingWindow);
      setReferenceOpenError("Gagal membuka file referensi. Silakan coba lagi.");
    } finally {
      setOpeningReferenceId(null);
    }
  };

  const handleOpenReference = (referenceId: string) => {
    window.open(
      `/agent/references/${referenceId}`,
      "_blank",
      "noopener,noreferrer",
    );
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

    if (!category) {
      setCurrentStep(1);
      setInputExpanded(true);
      setFieldErrors({
        category: "Pilih kategori keluhan sebelum menyimpan quick response.",
      });
      setFeedback({
        description: "Kategori dibutuhkan untuk menyimpan quick response.",
        title: "Kategori belum dipilih",
        variant: "error",
      });
      return;
    }

    const payload = mapQuickResponseToCreateRequest({
      category,
      complaintText,
      finalResponse,
      outcome,
      responseTarget,
      safeReply,
      selectedApologize,
      selectedEmpathize,
      selectedHear,
      selectedTakeAction,
      source,
      sourceHandle: username,
      sourceUrl: externalUrl,
      tone: responseTone,
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
    setCategory("");
    setResponseTarget("public-reply");
    setInputExpanded(true);
    setInputDirty(false);
    setSelectedOutcome(null);
    setCompletionState(null);
    setCreatedResult(null);
    setFieldErrors({});
    setFeedback(null);
    setOpeningReferenceId(null);
    setPreviewContext(emptyPreviewContext);
    setReferenceOpenError("");
    previewMutation.reset();
    fileUrlMutation.reset();
    createQuickResponseMutation.reset();
    escalateTicketMutation.reset();
    setCopiedLabel("");
    setBuilderOptions(null);
    setSuggestionSource(null);
    setPreviewError("");
    setSelectedHear("");
    setSelectedEmpathize("");
    setSelectedApologize("");
    setSelectedTakeAction("");
    setFinalResponse("");
    setSafeReply("");
    setIsFinalResponseManuallyEdited(false);
    setManualPreservedNotice("");
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
            { label: "Kategori", value: categoryLabel },
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
                collapsedContent={
                  !inputExpanded && complaintText.trim().length > 0 ? (
                    <CollapsedComplaintPreview
                      category={categoryLabel}
                      complaintText={complaintText}
                      source={sourceLabel}
                      username={username}
                    />
                  ) : null
                }
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
                    category={category}
                    complaintText={complaintText}
                    externalUrl={externalUrl}
                    fieldErrors={fieldErrors}
                    inputDirty={inputDirty}
                    isGenerating={isGenerating}
                    isReviewSource={isReviewSource}
                    onCancel={() => {
                      setInputExpanded(false);
                      setInputDirty(false);
                    }}
                    onCategoryChange={handleCategoryChange}
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
                    hasPreviewSuggestions={hasPreviewSuggestions}
                    rating={rating}
                    source={source}
                    username={username}
                  />
                ) : (
                  <InputSummary
                    category={categoryLabel}
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
                  isGenerating
                    ? "Generate suggestion"
                    : currentStep > 2
                      ? "Suggestion siap"
                      : "Buat dari input keluhan"
                }
                number={2}
                title="Build Response"
                action={
                  currentStep >= 2 && !flowLocked ? (
                    <ContextBadge>
                      {isGenerating
                        ? "Generating"
                        : suggestionSource === "fallback"
                          ? "Fallback suggestion"
                          : suggestionSource === "ai"
                            ? "AI suggestion"
                            : "Preview"}
                    </ContextBadge>
                  ) : null
                }
              >
                {isGenerating ? (
                  <BuildResponseSkeleton />
                ) : previewError ? (
                  <PreviewErrorState
                    message={previewError}
                    onRetry={handleGenerate}
                  />
                ) : builderOptions ? (
                  <ResponseBuilder
                    builderOptions={builderOptions}
                    flowLocked={flowLocked}
                    isFinalResponseManuallyEdited={
                      isFinalResponseManuallyEdited
                    }
                    manualPreservedNotice={manualPreservedNotice}
                    onApplySelectedToFinalResponse={
                      handleUpdateFinalResponseFromSelected
                    }
                    onContinue={() => setCurrentStep(3)}
                    onOpenReference={handleOpenReference}
                    onOpenReferenceFile={handleOpenReferenceFile}
                    onRegenerate={handleGenerate}
                    onSelectSentence={handleSelectSentence}
                    openingReferenceId={openingReferenceId}
                    previewContext={previewContext}
                    referenceOpenError={referenceOpenError}
                    selectedMap={selectedMap}
                    suggestionSource={suggestionSource}
                  />
                ) : (
                  <PreviewEmptyState />
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
                  onChangeFinalResponse={handleFinalResponseChange}
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
  category,
  complaintText,
  externalUrl,
  fieldErrors,
  hasPreviewSuggestions,
  inputDirty,
  isGenerating,
  isReviewSource,
  onCancel,
  onCategoryChange,
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
  category: string;
  complaintText: string;
  externalUrl: string;
  fieldErrors: QuickResponseFieldErrors;
  hasPreviewSuggestions: boolean;
  inputDirty: boolean;
  isGenerating: boolean;
  isReviewSource: boolean;
  onCancel: () => void;
  onCategoryChange: (value: string) => void;
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

      <FieldLabel label="Kategori keluhan" note="pilih sebelum menyimpan">
        <select
          className={inputClass}
          onChange={(event) => onCategoryChange(event.target.value)}
          value={category}
        >
          <option value="">Pilih kategori</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.category ? (
          <FieldError>{fieldErrors.category}</FieldError>
        ) : null}
      </FieldLabel>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldLabel label="Username / handle" required>
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
        <FieldLabel label="Link eksternal" required>
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
          {isGenerating
            ? "Generating..."
            : hasPreviewSuggestions
              ? "Regenerate Suggestion"
              : "Generate Suggestion"}
        </button>
      </div>
    </div>
  );
}

function InputSummary({
  category,
  complaintText,
  source,
  username,
}: {
  category: string;
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
        <ContextBadge>{category}</ContextBadge>
        {username ? <ContextBadge>{username}</ContextBadge> : null}
      </div>
    </div>
  );
}

function CollapsedComplaintPreview({
  category,
  complaintText,
  source,
  username,
}: {
  category: string;
  complaintText: string;
  source: string;
  username: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          Complaint yang ditangani
        </p>
        <p className="mt-1 line-clamp-2 text-sm italic leading-6 text-[var(--text-muted)]">
          "{complaintText}"
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:max-w-[280px] sm:justify-end">
        <ContextBadge>{source}</ContextBadge>
        <ContextBadge>{category}</ContextBadge>
        {username ? <ContextBadge>{username}</ContextBadge> : null}
      </div>
    </div>
  );
}

function ResponseBuilder({
  builderOptions,
  flowLocked,
  isFinalResponseManuallyEdited,
  manualPreservedNotice,
  onApplySelectedToFinalResponse,
  onContinue,
  onOpenReference,
  onOpenReferenceFile,
  onRegenerate,
  onSelectSentence,
  openingReferenceId,
  previewContext,
  referenceOpenError,
  selectedMap,
  suggestionSource,
}: {
  builderOptions: BuilderOptions;
  flowLocked: boolean;
  isFinalResponseManuallyEdited: boolean;
  manualPreservedNotice: string;
  onApplySelectedToFinalResponse: () => void;
  onContinue: () => void;
  onOpenReference: (referenceId: string) => void;
  onOpenReferenceFile: (referenceId: string) => void;
  onRegenerate: () => void;
  onSelectSentence: (key: BuilderKey, optionText: string) => void;
  openingReferenceId: string | null;
  previewContext: PreviewContext;
  referenceOpenError: string;
  selectedMap: Record<BuilderKey, string>;
  suggestionSource: QuickResponseSuggestionSource | null;
}) {
  return (
    <div className="space-y-4">
      {flowLocked ? (
        <WarningBanner>
          Rekomendasi sudah tidak sesuai. Buat ulang dari Langkah 1 sebelum
          lanjut.
        </WarningBanner>
      ) : null}

      {manualPreservedNotice ? (
        <NoticeBanner>{manualPreservedNotice}</NoticeBanner>
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--rail-ink)]">
            Backend suggestion siap dipilih.
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Pilih satu opsi pada setiap bagian, lalu review balasan akhir.
          </p>
        </div>
        {suggestionSource ? (
          <span className="inline-flex min-h-7 w-fit items-center rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-3 text-xs font-semibold text-[var(--signal-blue)]">
            {suggestionSource === "fallback" ? "Fallback suggestion" : "AI"}
          </span>
        ) : null}
      </div>

      <PreviewContextSections
        context={previewContext}
        onOpenReference={onOpenReference}
        onOpenReferenceFile={onOpenReferenceFile}
        openingReferenceId={openingReferenceId}
        referenceOpenError={referenceOpenError}
      />

      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          Penyusun balasan - pilih satu kalimat per bagian
        </p>
        <div className="space-y-4">
          {builderSections.map((section) => (
            <SentenceChoiceGroup
              description={section.description}
              disabled={flowLocked}
              key={section.key}
              label={section.label}
              onSelect={(optionText) =>
                onSelectSentence(section.key, optionText)
              }
              options={builderOptions[section.key]}
              selectedText={selectedMap[section.key]}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className={secondaryButtonClass}
            disabled={flowLocked}
            onClick={onRegenerate}
            type="button"
          >
            <RefreshCcw aria-hidden="true" size={13} />
            Regenerate Suggestion
          </button>
          {isFinalResponseManuallyEdited ? (
            <button
              className={secondaryButtonClass}
              disabled={flowLocked}
              onClick={onApplySelectedToFinalResponse}
              type="button"
            >
              Update final response from selected suggestions
            </button>
          ) : null}
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
          disabled={flowLocked}
          onClick={onContinue}
          type="button"
        >
          Review
          <ArrowRight aria-hidden="true" size={15} />
        </button>
      </div>
    </div>
  );
}

function PreviewContextSections({
  context,
  onOpenReference,
  onOpenReferenceFile,
  openingReferenceId,
  referenceOpenError,
}: {
  context: PreviewContext;
  onOpenReference: (referenceId: string) => void;
  onOpenReferenceFile: (referenceId: string) => void;
  openingReferenceId: string | null;
  referenceOpenError: string;
}) {
  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
              Referensi Terkait
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Bahan bantu dari backend untuk memahami konteks complaint.
            </p>
          </div>
          <ContextBadge>{context.relevantReferences.length} item</ContextBadge>
        </div>

        {referenceOpenError ? (
          <FieldError>{referenceOpenError}</FieldError>
        ) : null}

        <div className="mt-3 space-y-3">
          {context.relevantReferences.length > 0 ? (
            context.relevantReferences.map((reference) => (
              <RelevantReferenceCard
                isOpening={openingReferenceId === reference.id}
                key={reference.id}
                onOpen={() => onOpenReference(reference.id)}
                onOpenFile={() => onOpenReferenceFile(reference.id)}
                reference={reference}
              />
            ))
          ) : (
            <ContextEmptyState message="Belum ada referensi terkait." />
          )}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
              Kasus Serupa yang Pernah Diselesaikan
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Riwayat penyelesaian sebagai konteks baca, bukan template
              otomatis.
            </p>
          </div>
          <ContextBadge>
            {context.similarResolvedCases.length} item
          </ContextBadge>
        </div>

        <div className="mt-3 space-y-3">
          {context.similarResolvedCases.length > 0 ? (
            context.similarResolvedCases.map((resolvedCase, index) => (
              <SimilarResolvedCaseCard
                key={`${resolvedCase.category}-${resolvedCase.resolvedAt ?? index}`}
                resolvedCase={resolvedCase}
              />
            ))
          ) : (
            <ContextEmptyState message="Belum ada kasus serupa yang ditemukan." />
          )}
        </div>
      </section>
    </div>
  );
}

function RelevantReferenceCard({
  isOpening,
  onOpen,
  onOpenFile,
  reference,
}: {
  isOpening: boolean;
  onOpen: () => void;
  onOpenFile: () => void;
  reference: RelevantReference;
}) {
  return (
    <article className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-[var(--rail-ink)]">
            {reference.title}
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <ContextBadge>
              {labelFor(categoryOptions, reference.category)}
            </ContextBadge>
            <ContextBadge>
              {formatSourceType(reference.sourceType)}
            </ContextBadge>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className={secondaryButtonClass}
            onClick={onOpen}
            type="button"
          >
            <Link2 aria-hidden="true" size={13} />
            Buka referensi
          </button>
          {reference.fileName ? (
            <button
              className={secondaryButtonClass}
              disabled={isOpening}
              onClick={onOpenFile}
              type="button"
            >
              <Link2 aria-hidden="true" size={13} />
              {isOpening ? "Membuka..." : "Buka file"}
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
        {reference.snippet}
      </p>
      {reference.fileName ? (
        <p className="mt-3 truncate text-[11px] font-medium text-[var(--text-tertiary)]">
          File: {reference.fileName}
        </p>
      ) : null}
    </article>
  );
}

function SimilarResolvedCaseCard({
  resolvedCase,
}: {
  resolvedCase: SimilarResolvedCase;
}) {
  return (
    <article className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ContextBadge>
          {labelFor(categoryOptions, resolvedCase.category)}
        </ContextBadge>
        <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
          {formatResolvedAt(resolvedCase.resolvedAt)}
        </span>
      </div>
      <div className="mt-3 space-y-3">
        <PreviewBox
          isClamped={false}
          title="Complaint sebelumnya"
          value={resolvedCase.complaintTextPreview}
        />
        <PreviewBox
          isClamped={false}
          title="Balasan akhir sebelumnya"
          value={resolvedCase.finalResponsePreview}
        />
      </div>
    </article>
  );
}

function ContextEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--text-muted)]">
      {message}
    </div>
  );
}

function PreviewEmptyState() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4">
      <Info
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-[var(--signal-blue)]"
        size={18}
      />
      <div>
        <p className="text-sm font-semibold text-[var(--rail-ink)]">
          Belum ada suggestion.
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
          Masukkan keluhan pelanggan lalu klik Generate Suggestion.
        </p>
      </div>
    </div>
  );
}

function PreviewErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-3">
      <WarningBanner>{message}</WarningBanner>
      <button className={secondaryButtonClass} onClick={onRetry} type="button">
        <RefreshCcw aria-hidden="true" size={13} />
        Coba lagi
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
    icon: ReactNode;
  }[];
  permissionError?: string;
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
          </button>
        ))}
      </div>

      <div>
        <PreviewBox title="Balasan akhir lengkap" value={finalResponse} />
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
  collapsedContent,
  isActive,
  isComplete = false,
  isLocked = false,
  meta,
  number,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  collapsedContent?: ReactNode;
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
      ) : collapsedContent ? (
        <div className="border-t border-[var(--rail-border)] bg-[var(--surface-muted)] px-4 py-3">
          {collapsedContent}
        </div>
      ) : null}
    </section>
  );
}

const skeletonRows = ["hear", "empathize", "apologize", "take-action"];

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
        Menghasilkan opsi Tangkap Keluhan, Tunjukkan Empati, Minta Maaf, dan
        Tindak Lanjut...
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
  selectedText,
}: {
  description: string;
  disabled: boolean;
  label: string;
  onSelect: (optionText: string) => void;
  options: SentenceOption[];
  selectedText: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-[var(--rail-ink)]">{label}</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
      <div className="mt-3 space-y-2">
        {options.map((option) => (
          <button
            className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm leading-6 transition ${
              selectedText === option.text
                ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--rail-ink)]"
                : "border-[var(--rail-border)] bg-[var(--background)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--rail-ink)]"
            }`}
            disabled={disabled}
            key={option.id}
            onClick={() => onSelect(option.text)}
            type="button"
          >
            {option.text}
          </button>
        ))}
      </div>
    </section>
  );
}

function PreviewBox({
  isClamped = true,
  title,
  value,
}: {
  isClamped?: boolean;
  title: string;
  value: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <h4 className="text-xs font-semibold text-[var(--rail-ink)]">{title}</h4>
      <p
        className={`mt-2 text-xs leading-5 text-[var(--text-muted)] ${
          isClamped ? "line-clamp-5" : ""
        }`}
      >
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

function WarningBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] p-3 text-xs leading-5 text-[var(--signal-amber-dark)]">
      <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={14} />
      <span>{children}</span>
    </div>
  );
}

function NoticeBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] p-3 text-xs leading-5 text-[var(--signal-blue)]">
      <Info aria-hidden="true" className="mt-0.5 shrink-0" size={14} />
      <span>{children}</span>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";

const textareaClass =
  "w-full resize-none rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-3 text-sm leading-6 text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";

const secondaryButtonClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]";

function createBuilderOptions(
  preview: QuickResponsePreviewData,
): BuilderOptions {
  return {
    apologize: toSentenceOptions("apologize", preview.suggestions.apologize),
    empathize: toSentenceOptions("empathize", preview.suggestions.empathize),
    hear: toSentenceOptions("hear", preview.suggestions.hear),
    takeAction: toSentenceOptions("takeAction", preview.suggestions.takeAction),
  };
}

function toSentenceOptions(key: BuilderKey, values: string[]) {
  return values.map((text, index) => ({
    id: `${key}-${index + 1}`,
    text,
  }));
}

function getDefaultSelections(
  options: BuilderOptions,
): Record<BuilderKey, string> {
  return {
    apologize: options.apologize[0]?.text ?? "",
    empathize: options.empathize[0]?.text ?? "",
    hear: options.hear[0]?.text ?? "",
    takeAction: options.takeAction[0]?.text ?? "",
  };
}

function buildFinalResponse(selected: Partial<Record<BuilderKey, string>>) {
  return [
    selected.hear,
    selected.empathize,
    selected.apologize,
    selected.takeAction,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildSafeReply(selected: Partial<Record<BuilderKey, string>>) {
  const safeAction =
    "Laporan Kakak akan kami teruskan ke tim terkait untuk pengecekan dan tindak lanjut lebih lanjut.";
  const parts = [selected.hear, selected.empathize, selected.apologize].filter(
    Boolean,
  );

  return [...parts, safeAction].join(" ");
}

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function formatSourceType(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatResolvedAt(value: string | null) {
  if (!value) {
    return "Tanggal selesai belum tersedia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function getPreviewErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: string }).code
      : undefined;
  const message = error instanceof Error ? error.message : "";
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  if (code === "ECONNABORTED" || message.includes("terlalu lama")) {
    return "Generate suggestion membutuhkan waktu terlalu lama. Coba lagi sebentar lagi.";
  }

  if (status === 401) {
    return "Sesi berakhir. Silakan login kembali.";
  }

  if (status === 403) {
    return "Role ini tidak dapat generate suggestion.";
  }

  if (status === 422) {
    return "Pastikan teks keluhan sudah diisi dan kategori valid.";
  }

  return "Gagal generate suggestion. Periksa koneksi lalu coba lagi.";
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
