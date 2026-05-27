"use client";

import {
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MessageSquareText,
  RefreshCcw,
  Save,
  Send,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";

interface ComplaintInsight {
  topic: string;
  sentiment: string;
  urgency: string;
  reputationRisk: string;
  recommendedChannel: string;
  requiresFollowUp: string;
  recommendedAction: string;
}

type ResponseStepKey = "hear" | "empathize" | "apologise" | "takeAction";

interface ResponseOption {
  id: string;
  text: string;
}

type ResponseBuilderOptions = Record<ResponseStepKey, ResponseOption[]>;

type SelectedResponseOptions = Record<ResponseStepKey, string>;

interface HardcodedResponse {
  insight: ComplaintInsight;
  responseDraft: string;
  builderOptions: ResponseBuilderOptions;
}

const emptyInsight: ComplaintInsight = {
  topic: "",
  sentiment: "",
  urgency: "",
  reputationRisk: "",
  recommendedChannel: "",
  requiresFollowUp: "",
  recommendedAction: "",
};

const sourceOptions = [
  { value: "twitter", label: "X / Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google-play", label: "Google Play" },
  { value: "app-store", label: "App Store" },
  { value: "other", label: "Lainnya" },
];

const serviceContextOptions = [
  { value: "train-ticket", label: "Tiket kereta" },
  { value: "refund", label: "Refund" },
  { value: "cancellation", label: "Pembatalan" },
  { value: "reschedule", label: "Jadwal ulang" },
  { value: "app-login", label: "Aplikasi / login" },
  { value: "payment", label: "Pembayaran" },
  { value: "travel-facility", label: "Fasilitas perjalanan" },
  { value: "lost-item", label: "Barang tertinggal" },
  { value: "other", label: "Lainnya" },
];

const toneOptions = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Ramah" },
  { value: "concise", label: "Ringkas" },
];

const responseTargetOptions = [
  { value: "public-reply", label: "Balasan publik" },
  { value: "direct-message", label: "Pesan pribadi / DM" },
  { value: "app-review", label: "Ulasan aplikasi" },
  { value: "internal-note", label: "Catatan internal" },
];

const delayResponse: HardcodedResponse = {
  insight: {
    topic: "Keterlambatan perjalanan",
    sentiment: "Frustrasi",
    urgency: "Tinggi",
    reputationRisk: "Sedang",
    recommendedChannel: "Balas publik, lalu arahkan ke DM",
    requiresFollowUp: "Ya",
    recommendedAction:
      "Balas secara publik untuk menunjukkan respons cepat, lalu arahkan pelanggan ke DM agar detail tiket dapat dicek tanpa membuka data pribadi.",
  },
  responseDraft:
    "Halo Kak, kami memahami kekecewaan Kakak atas keterlambatan perjalanan dan kurangnya informasi yang diterima. Mohon maaf atas ketidaknyamanan ini. Agar kami dapat membantu pengecekan lebih lanjut dan memberikan opsi penanganan yang sesuai, silakan kirim detail kode booking atau nomor tiket melalui DM. Tim kami akan bantu tindak lanjuti.",
  builderOptions: {
    hear: [
      {
        id: "hear-delay-1",
        text: "Kami menerima keluhan Kakak terkait keterlambatan perjalanan.",
      },
      {
        id: "hear-delay-2",
        text: "Kami memahami bahwa perjalanan Kakak mengalami keterlambatan yang cukup lama.",
      },
      {
        id: "hear-delay-3",
        text: "Terima kasih sudah menyampaikan kendala perjalanan ini kepada kami.",
      },
    ],
    empathize: [
      {
        id: "empathy-delay-1",
        text: "Kami mengerti situasi ini sangat mengganggu, apalagi jika Kakak memiliki agenda penting.",
      },
      {
        id: "empathy-delay-2",
        text: "Kami paham pengalaman ini membuat Kakak kecewa dan merasa dirugikan.",
      },
      {
        id: "empathy-delay-3",
        text: "Kami memahami bahwa kurangnya informasi selama menunggu dapat membuat situasi terasa semakin tidak nyaman.",
      },
    ],
    apologise: [
      {
        id: "apology-delay-1",
        text: "Mohon maaf atas ketidaknyamanan yang terjadi.",
      },
      {
        id: "apology-delay-2",
        text: "Kami meminta maaf atas keterlambatan dan kurangnya informasi yang Kakak terima.",
      },
      {
        id: "apology-delay-3",
        text: "Maaf atas pengalaman perjalanan yang tidak sesuai harapan ini.",
      },
    ],
    takeAction: [
      {
        id: "action-delay-1",
        text: "Silakan kirim nomor booking melalui DM agar tim kami dapat membantu pengecekan lebih lanjut.",
      },
      {
        id: "action-delay-2",
        text: "Tim kami akan meninjau laporan ini dan membantu memberikan opsi penanganan yang sesuai.",
      },
      {
        id: "action-delay-3",
        text: "Untuk keterlambatan lebih dari 2 jam, Kakak dapat mengajukan refund atau penjadwalan ulang sesuai ketentuan.",
      },
    ],
  },
};

const refundResponse: HardcodedResponse = {
  insight: {
    topic: "Refund belum diterima",
    sentiment: "Tidak puas",
    urgency: "Tinggi",
    reputationRisk: "Sedang",
    recommendedChannel: "Arahkan ke DM untuk pengecekan data",
    requiresFollowUp: "Ya",
    recommendedAction:
      "Simpan keluhan sebagai tiket karena pelanggan membutuhkan pengecekan status refund dan kemungkinan eskalasi ke tim terkait.",
  },
  responseDraft:
    "Halo Kak, kami memahami kekhawatiran Kakak karena proses refund belum diterima setelah menunggu cukup lama. Mohon maaf atas ketidaknyamanan ini. Agar dapat kami cek statusnya secara spesifik, silakan kirim nomor booking dan tanggal pengajuan refund melalui DM. Kami akan bantu tindak lanjuti ke tim terkait.",
  builderOptions: {
    hear: [
      {
        id: "hear-refund-1",
        text: "Kami menerima keluhan Kakak terkait proses refund yang belum diterima.",
      },
      {
        id: "hear-refund-2",
        text: "Terima kasih sudah menghubungi kami mengenai status pengembalian dana Kakak.",
      },
      {
        id: "hear-refund-3",
        text: "Kami memahami bahwa Kakak ingin mendapatkan kejelasan terkait proses refund.",
      },
    ],
    empathize: [
      {
        id: "empathy-refund-1",
        text: "Kami paham menunggu refund tanpa kepastian bisa membuat Kakak khawatir.",
      },
      {
        id: "empathy-refund-2",
        text: "Kami mengerti bahwa keterlambatan pengembalian dana dapat terasa sangat merugikan.",
      },
      {
        id: "empathy-refund-3",
        text: "Kami memahami rasa tidak nyaman karena Kakak sudah menunggu cukup lama.",
      },
    ],
    apologise: [
      {
        id: "apology-refund-1",
        text: "Mohon maaf atas ketidaknyamanan dalam proses refund ini.",
      },
      {
        id: "apology-refund-2",
        text: "Kami meminta maaf jika proses pengembalian dana belum berjalan sesuai harapan.",
      },
      {
        id: "apology-refund-3",
        text: "Maaf atas keterlambatan dan kurangnya kejelasan yang Kakak alami.",
      },
    ],
    takeAction: [
      {
        id: "action-refund-1",
        text: "Silakan kirim nomor booking dan tanggal pengajuan refund melalui DM agar tim kami dapat mengecek statusnya.",
      },
      {
        id: "action-refund-2",
        text: "Kami akan bantu teruskan laporan ini ke tim terkait untuk pengecekan lebih lanjut.",
      },
      {
        id: "action-refund-3",
        text: "Tim kami akan memeriksa status refund dan memberikan pembaruan melalui kanal bantuan resmi.",
      },
    ],
  },
};

const loginResponse: HardcodedResponse = {
  insight: {
    topic: "Kendala login aplikasi",
    sentiment: "Bingung / kecewa",
    urgency: "Sedang",
    reputationRisk: "Rendah",
    recommendedChannel: "Berikan langkah awal dan arahkan ke bantuan teknis",
    requiresFollowUp: "Mungkin",
    recommendedAction:
      "Berikan langkah awal yang aman untuk dicoba pelanggan, lalu arahkan ke kanal bantuan resmi jika kendala masih terjadi.",
  },
  responseDraft:
    "Halo Kak, mohon maaf atas kendala login yang dialami. Silakan coba tutup aplikasi sepenuhnya, bersihkan cache, lalu masuk kembali. Jika masih belum berhasil, mohon hubungi kanal bantuan resmi kami dengan menyertakan detail perangkat dan email akun agar tim kami dapat melakukan pengecekan lebih lanjut.",
  builderOptions: {
    hear: [
      {
        id: "hear-login-1",
        text: "Kami menerima keluhan Kakak terkait kendala login pada aplikasi.",
      },
      {
        id: "hear-login-2",
        text: "Terima kasih sudah melaporkan kendala yang terjadi setelah pembaruan aplikasi.",
      },
      {
        id: "hear-login-3",
        text: "Kami memahami bahwa Kakak mengalami kesulitan untuk masuk ke aplikasi.",
      },
    ],
    empathize: [
      {
        id: "empathy-login-1",
        text: "Kami paham kendala login bisa sangat mengganggu, terutama saat Kakak perlu mengakses layanan dengan cepat.",
      },
      {
        id: "empathy-login-2",
        text: "Kami mengerti situasi ini membuat Kakak tidak nyaman karena aplikasi belum dapat digunakan seperti biasa.",
      },
      {
        id: "empathy-login-3",
        text: "Kami memahami rasa frustrasi ketika sudah mencoba beberapa langkah tetapi kendala masih terjadi.",
      },
    ],
    apologise: [
      {
        id: "apology-login-1",
        text: "Mohon maaf atas kendala yang Kakak alami.",
      },
      {
        id: "apology-login-2",
        text: "Kami meminta maaf atas ketidaknyamanan setelah pembaruan aplikasi.",
      },
      {
        id: "apology-login-3",
        text: "Maaf karena pengalaman menggunakan aplikasi belum berjalan lancar.",
      },
    ],
    takeAction: [
      {
        id: "action-login-1",
        text: "Silakan coba tutup aplikasi sepenuhnya, bersihkan cache, lalu masuk kembali.",
      },
      {
        id: "action-login-2",
        text: "Jika masih belum berhasil, mohon hubungi kanal bantuan resmi dengan menyertakan detail perangkat dan email akun.",
      },
      {
        id: "action-login-3",
        text: "Tim kami akan membantu pengecekan lebih lanjut jika Kakak mengirimkan detail kendala melalui kanal bantuan resmi.",
      },
    ],
  },
};

const genericResponse: HardcodedResponse = {
  insight: {
    topic: "Keluhan pelanggan",
    sentiment: "Perlu ditinjau",
    urgency: "Sedang",
    reputationRisk: "Sedang",
    recommendedChannel: "Tanggapi dengan sopan dan arahkan ke kanal bantuan",
    requiresFollowUp: "Mungkin",
    recommendedAction:
      "Berikan respons awal yang menunjukkan bahwa keluhan telah diterima, lalu minta pelanggan melanjutkan ke kanal bantuan resmi agar tim dapat menindaklanjuti.",
  },
  responseDraft:
    "Halo Kak, terima kasih sudah menyampaikan keluhan ini. Kami memahami bahwa pengalaman tersebut tidak sesuai harapan dan mohon maaf atas ketidaknyamanan yang terjadi. Agar kami dapat membantu lebih lanjut, silakan kirim detail kendala melalui DM atau kanal bantuan resmi kami. Tim kami akan bantu menindaklanjuti secepatnya.",
  builderOptions: {
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
        id: "empathy-generic-1",
        text: "Kami memahami bahwa pengalaman ini tidak sesuai dengan harapan Kakak.",
      },
      {
        id: "empathy-generic-2",
        text: "Kami paham situasi seperti ini dapat membuat Kakak merasa tidak nyaman.",
      },
      {
        id: "empathy-generic-3",
        text: "Kami mengerti keluhan ini penting untuk segera ditindaklanjuti.",
      },
    ],
    apologise: [
      {
        id: "apology-generic-1",
        text: "Mohon maaf atas ketidaknyamanan yang terjadi.",
      },
      {
        id: "apology-generic-2",
        text: "Kami meminta maaf atas pengalaman yang belum sesuai harapan.",
      },
      {
        id: "apology-generic-3",
        text: "Maaf atas kendala yang Kakak alami.",
      },
    ],
    takeAction: [
      {
        id: "action-generic-1",
        text: "Silakan kirim detail lebih lanjut melalui DM atau kanal bantuan resmi agar tim kami dapat membantu pengecekan.",
      },
      {
        id: "action-generic-2",
        text: "Tim kami akan meninjau laporan ini dan membantu memberikan tindak lanjut yang sesuai.",
      },
      {
        id: "action-generic-3",
        text: "Kami akan bantu arahkan laporan ini ke tim terkait untuk pengecekan lebih lanjut.",
      },
    ],
  },
};

export function QuickResponse() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [source, setSource] = useState("twitter");
  const [username, setUsername] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [rating, setRating] = useState("1");
  const [complaintText, setComplaintText] = useState("");
  const [serviceContext, setServiceContext] = useState("train-ticket");
  const [tone, setTone] = useState("formal");
  const [responseTarget, setResponseTarget] = useState("public-reply");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [responseDraft, setResponseDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedTicketId, setSavedTicketId] = useState<string | null>(null);
  const [insight, setInsight] = useState<ComplaintInsight>(emptyInsight);
  const [responseOptions, setResponseOptions] =
    useState<ResponseBuilderOptions | null>(null);
  const [selectedResponseOptions, setSelectedResponseOptions] =
    useState<SelectedResponseOptions>({
      hear: "",
      empathize: "",
      apologise: "",
      takeAction: "",
    });

  const isReviewSource = source === "google-play" || source === "app-store";
  const canGenerate = complaintText.trim().length > 0;
  const activeSourceLabel = useMemo(() => {
    return (
      sourceOptions.find((option) => option.value === source)?.label ??
      "Kanal eksternal"
    );
  }, [source]);

  const handleSourceChange = (nextSource: string) => {
    setSource(nextSource);

    if (nextSource === "google-play" || nextSource === "app-store") {
      setResponseTarget("app-review");
    } else {
      setResponseTarget("public-reply");
    }
  };

  const handleGenerate = () => {
    if (!complaintText.trim()) {
      return;
    }

    setIsGenerating(true);
    setIsGenerated(false);
    setSavedTicketId(null);
    setCopied(false);

    window.setTimeout(() => {
      const result = getHardcodedResponse(complaintText);

      setInsight(result.insight);
      setResponseOptions(result.builderOptions);
      
      const defaultSelected = getDefaultSelectedOptions(result.builderOptions);
      setSelectedResponseOptions(defaultSelected);
      
      setResponseDraft(
        buildResponseDraft(result.builderOptions, defaultSelected),
      );
      setIsGenerating(false);
      setIsGenerated(true);
    }, 700);
  };

  const handleRegenerate = () => {
    if (!responseOptions) {
      return;
    }

    setIsGenerating(true);
    setSavedTicketId(null);
    setCopied(false);

    window.setTimeout(() => {
      const defaultSelected = getDefaultSelectedOptions(responseOptions);
      setSelectedResponseOptions(defaultSelected);
      setResponseDraft(buildResponseDraft(responseOptions, defaultSelected));
      setIsGenerating(false);
    }, 500);
  };

  const handleCopy = async () => {
    if (!responseDraft) {
      return;
    }

    try {
      await navigator.clipboard.writeText(responseDraft);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveAsTicket = () => {
    const ticketId = `EXT-${Math.floor(1000 + Math.random() * 9000)}`;
    setSavedTicketId(ticketId);
  };

  const handleClear = () => {
    setSource("twitter");
    setUsername("");
    setExternalUrl("");
    setRating("1");
    setComplaintText("");
    setServiceContext("train-ticket");
    setTone("formal");
    setResponseTarget("public-reply");
    setIsGenerating(false);
    setIsGenerated(false);
    setResponseDraft("");
    setCopied(false);
    setSavedTicketId(null);
    setInsight(emptyInsight);
    setResponseOptions(null);
    setSelectedResponseOptions({
      hear: "",
      empathize: "",
      apologise: "",
      takeAction: "",
    });
  };

  const handleSelectResponseOption = (
    step: ResponseStepKey,
    optionId: string,
  ) => {
    if (!responseOptions) return;

    const nextSelected = {
      ...selectedResponseOptions,
      [step]: optionId,
    };

    setSelectedResponseOptions(nextSelected);
    setResponseDraft(buildResponseDraft(responseOptions, nextSelected));
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          stats={[
            { label: "External", value: "6 kanal" },
            { label: "Draft", value: isGenerated ? "Siap" : "Baru" },
            { label: "Follow up", value: savedTicketId ? "Tiket" : "Opsional" },
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
                Mode prototipe
              </span>
            }
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((isOpen) => !isOpen)}
            roleLabel="Support agent"
            userName="Rizky A."
          />

          <section className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
            <header className="border-b border-[var(--rail-border)] bg-[linear-gradient(135deg,#fbfcf7_0%,#edf4ef_52%,#dce9f3_100%)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                    Kanal eksternal
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)] sm:text-3xl">
                    Quick Response
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    Bantu tanggapi keluhan dari media sosial, ulasan aplikasi,
                    dan kanal publik lainnya.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
                  <SignalPill label="Sumber" value={activeSourceLabel} />
                  <SignalPill
                    label="Teks"
                    value={`${complaintText.length} karakter`}
                  />
                  <SignalPill
                    label="Status"
                    value={
                      isGenerating ? "Proses" : isGenerated ? "Draft" : "Input"
                    }
                  />
                </div>
              </div>
            </header>

            <div className="grid min-h-[720px] grid-cols-1 lg:grid-cols-[minmax(360px,0.86fr)_minmax(0,1.14fr)]">
              <section className="border-b border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 lg:border-b-0 lg:border-r sm:p-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--rail-ink)] text-white">
                    <ClipboardList aria-hidden="true" size={19} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
                      Detail keluhan
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Lengkapi konteks sebelum membuat draf.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <FieldGroup
                    description="Dari mana keluhan ini berasal?"
                    label="Sumber keluhan"
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {sourceOptions.map((option) => (
                        <button
                          className={`min-h-10 rounded-lg border px-3 text-left text-xs font-semibold transition ${
                            source === option.value
                              ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
                              : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--rail-ink)]"
                          }`}
                          key={option.value}
                          onClick={() => handleSourceChange(option.value)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </FieldGroup>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldGroup label="Username / handle">
                      <div className="relative">
                        <UserRound
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                          size={15}
                        />
                        <input
                          className={inputClassName("pl-9")}
                          onChange={(event) => setUsername(event.target.value)}
                          placeholder="Opsional"
                          type="text"
                          value={username}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Link keluhan">
                      <div className="relative">
                        <Link2
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                          size={15}
                        />
                        <input
                          className={inputClassName("pl-9")}
                          onChange={(event) =>
                            setExternalUrl(event.target.value)
                          }
                          placeholder="Opsional, untuk pelacakan internal"
                          type="url"
                          value={externalUrl}
                        />
                      </div>
                    </FieldGroup>
                  </div>

                  {isReviewSource ? (
                    <FieldGroup label="Rating ulasan">
                      <div className="relative">
                        <Star
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--signal-amber)]"
                          size={15}
                        />
                        <select
                          className={inputClassName("pl-9")}
                          onChange={(event) => setRating(event.target.value)}
                          value={rating}
                        >
                          <option value="1">1 bintang</option>
                          <option value="2">2 bintang</option>
                          <option value="3">3 bintang</option>
                          <option value="4">4 bintang</option>
                          <option value="5">5 bintang</option>
                        </select>
                      </div>
                    </FieldGroup>
                  ) : null}

                  <FieldGroup label="Isi keluhan">
                    <textarea
                      className="min-h-[172px] w-full resize-none rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-3 text-sm leading-6 text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                      onChange={(event) => setComplaintText(event.target.value)}
                      placeholder="Tempel keluhan pelanggan di sini"
                      value={complaintText}
                    />
                    <p className="mt-2 text-right text-[11px] font-medium text-[var(--text-muted)]">
                      {complaintText.length} karakter
                    </p>
                  </FieldGroup>

                  <FieldGroup label="Konteks layanan">
                    <select
                      className={inputClassName()}
                      onChange={(event) =>
                        setServiceContext(event.target.value)
                      }
                      value={serviceContext}
                    >
                      {serviceContextOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FieldGroup>

                  <FieldGroup label="Gaya respons">
                    <SegmentedControl
                      options={toneOptions}
                      value={tone}
                      onChange={setTone}
                    />
                  </FieldGroup>

                  <FieldGroup label="Tujuan respons">
                    <SegmentedControl
                      options={responseTargetOptions}
                      value={responseTarget}
                      onChange={setResponseTarget}
                    />
                  </FieldGroup>

                  <button
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
                    disabled={!canGenerate || isGenerating}
                    onClick={handleGenerate}
                    type="button"
                  >
                    {isGenerating ? (
                      <Loader2
                        aria-hidden="true"
                        className="animate-spin"
                        size={17}
                      />
                    ) : (
                      <Send aria-hidden="true" size={17} />
                    )}
                    Buat draf respons
                  </button>
                </div>
              </section>

              <section className="bg-[linear-gradient(180deg,#f8faf5_0%,#edf2ef_100%)] p-4 sm:p-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]">
                    <MessageSquareText aria-hidden="true" size={19} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
                      Draf dan rekomendasi
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Edit sebelum disalin ke kanal eksternal.
                    </p>
                  </div>
                </div>

                {!isGenerated && !isGenerating ? <EmptyState /> : null}

                {isGenerating ? <LoadingState /> : null}

                {isGenerated && !isGenerating ? (
                  <div className="space-y-4">
                    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
                          Ringkasan keluhan
                        </h3>
                        <span className="rounded-full bg-[var(--signal-amber-soft)] px-3 py-1 text-[10px] font-semibold text-[var(--signal-amber-dark)]">
                          {insight.urgency}
                        </span>
                      </div>
                      <dl className="grid gap-2 sm:grid-cols-2">
                        <InsightItem
                          label="Topik utama"
                          value={insight.topic}
                        />
                        <InsightItem
                          label="Sentimen"
                          value={insight.sentiment}
                        />
                        <InsightItem
                          label="Risiko reputasi"
                          value={insight.reputationRisk}
                        />
                        <InsightItem
                          label="Butuh tindak lanjut"
                          value={insight.requiresFollowUp}
                        />
                      </dl>
                    </section>

                    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ExternalLink
                          aria-hidden="true"
                          className="text-[var(--signal-blue)]"
                          size={16}
                        />
                        <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
                          Rekomendasi tindak lanjut
                        </h3>
                      </div>
                      <p className="text-sm leading-6 text-[var(--rail-ink)]">
                        {insight.recommendedAction}
                      </p>
                      <p className="mt-3 rounded-lg bg-[var(--background)] px-3 py-2 text-xs text-[var(--text-muted)]">
                        Kanal rekomendasi: {insight.recommendedChannel}
                      </p>
                    </section>

                    {responseOptions ? (
                      <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
                            Response builder
                          </h3>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Pick one sentence for each step. The response draft will update automatically.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <ResponseBuilderStep
                            label="Hear"
                            description="Recognise what the customer is complaining about."
                            options={responseOptions.hear}
                            selectedId={selectedResponseOptions.hear}
                            onSelect={(id) => handleSelectResponseOption("hear", id)}
                          />
                          <ResponseBuilderStep
                            label="Empathize"
                            description="Show that the situation is understood."
                            options={responseOptions.empathize}
                            selectedId={selectedResponseOptions.empathize}
                            onSelect={(id) => handleSelectResponseOption("empathize", id)}
                          />
                          <ResponseBuilderStep
                            label="Apologise"
                            description="Say sorry clearly without over-explaining."
                            options={responseOptions.apologise}
                            selectedId={selectedResponseOptions.apologise}
                            onSelect={(id) => handleSelectResponseOption("apologise", id)}
                          />
                          <ResponseBuilderStep
                            label="Take action"
                            description="Tell the customer what they can do next."
                            options={responseOptions.takeAction}
                            selectedId={selectedResponseOptions.takeAction}
                            onSelect={(id) => handleSelectResponseOption("takeAction", id)}
                          />
                        </div>
                      </section>
                    ) : null}

                    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
                      <h3 className="mb-3 text-sm font-semibold text-[var(--rail-ink)]">
                        Final response
                      </h3>
                      <textarea
                        className="min-h-[220px] w-full resize-none rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-3 text-sm leading-6 text-[var(--rail-ink)] outline-none transition focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                        onChange={(event) =>
                          setResponseDraft(event.target.value)
                        }
                        value={responseDraft}
                      />

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <ActionButton
                          icon={<RefreshCcw aria-hidden="true" size={15} />}
                          label="Buat ulang"
                          onClick={handleRegenerate}
                        />
                        <ActionButton
                          icon={
                            copied ? (
                              <CheckCircle2 aria-hidden="true" size={15} />
                            ) : (
                              <Copy aria-hidden="true" size={15} />
                            )
                          }
                          label={copied ? "Tersalin" : "Salin respons"}
                          onClick={handleCopy}
                        />
                        <ActionButton
                          icon={<Save aria-hidden="true" size={15} />}
                          label="Simpan sebagai tiket"
                          onClick={handleSaveAsTicket}
                        />
                        <ActionButton
                          icon={<Trash2 aria-hidden="true" size={15} />}
                          label="Bersihkan"
                          onClick={handleClear}
                          tone="danger"
                        />
                      </div>
                    </section>

                    <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
                      <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
                        Tindak lanjut internal
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        Simpan keluhan sebagai tiket bila membutuhkan pengecekan
                        refund, pembayaran, barang tertinggal, atau isu booking.
                      </p>
                    </section>

                    {savedTicketId ? (
                      <section className="rounded-lg border border-[var(--signal-green)] bg-[var(--signal-green-soft)] p-4 text-[var(--signal-green-dark)]">
                        <div className="flex items-start gap-3">
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 shrink-0"
                            size={18}
                          />
                          <div>
                            <h3 className="text-sm font-semibold">
                              Tersimpan sebagai tiket #{savedTicketId}
                            </h3>
                            <p className="mt-1 text-xs leading-5">
                              Keluhan ini sekarang dapat dipantau oleh tim.
                            </p>
                          </div>
                        </div>
                      </section>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function FieldGroup({
  children,
  description,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <div className="block">
      <span className="block text-xs font-semibold text-[var(--rail-ink)]">
        {label}
      </span>
      {description ? (
        <span className="mt-1 block text-[11px] text-[var(--text-muted)]">
          {description}
        </span>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SegmentedControl({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  value: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {options.map((option) => (
        <button
          className={`min-h-10 rounded-lg border px-3 text-left text-xs font-semibold transition ${
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

function SignalPill({ label, value }: { label: string; value: string }) {
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

function EmptyState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-[var(--rail-border)] bg-[rgba(251,252,247,0.64)] p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]">
          <MessageSquareText aria-hidden="true" size={22} />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-[var(--rail-ink)]">
          Tempel keluhan pelanggan untuk membuat draf respons.
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Cocok untuk media sosial, ulasan aplikasi, dan kanal eksternal
          lainnya.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-8 text-center">
      <div>
        <Loader2
          aria-hidden="true"
          className="mx-auto animate-spin text-[var(--signal-blue)]"
          size={30}
        />
        <h3 className="mt-4 text-lg font-semibold text-[var(--rail-ink)]">
          Menganalisis keluhan...
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Menyusun draf respons...
        </p>
      </div>
    </div>
  );
}

function InsightItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--background)] px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--rail-ink)]">
        {value}
      </dd>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
        tone === "danger"
          ? "border-[var(--signal-red-soft)] bg-[var(--surface-panel)] text-[var(--signal-red-dark)] hover:bg-[var(--signal-red-soft)]"
          : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--rail-ink)] hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ResponseBuilderStep({
  label,
  description,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  description: string;
  options: ResponseOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <h4 className="text-xs font-semibold text-[var(--rail-ink)]">
          {label}
        </h4>
        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
          {description}
        </p>
      </div>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm leading-6 transition ${
              selectedId === option.id
                ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--rail-ink)] shadow-sm"
                : "border-[var(--rail-border)] bg-[var(--background)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--rail-ink)]"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function getDefaultSelectedOptions(
  options: ResponseBuilderOptions,
): SelectedResponseOptions {
  return {
    hear: options.hear[0]?.id ?? "",
    empathize: options.empathize[0]?.id ?? "",
    apologise: options.apologise[0]?.id ?? "",
    takeAction: options.takeAction[0]?.id ?? "",
  };
}

function buildResponseDraft(
  options: ResponseBuilderOptions,
  selected: SelectedResponseOptions,
) {
  const steps: ResponseStepKey[] = [
    "hear",
    "empathize",
    "apologise",
    "takeAction",
  ];

  return steps
    .map((step) => {
      return options[step].find((option) => option.id === selected[step])?.text;
    })
    .filter(Boolean)
    .join(" ");
}

function inputClassName(extraClassName = "") {
  return `h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)] ${extraClassName}`;
}

function getHardcodedResponse(text: string) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("delay") ||
    lowerText.includes("terlambat") ||
    lowerText.includes("keterlambatan")
  ) {
    return delayResponse;
  }

  if (
    lowerText.includes("refund") ||
    lowerText.includes("pengembalian dana") ||
    lowerText.includes("uang kembali")
  ) {
    return refundResponse;
  }

  if (
    lowerText.includes("login") ||
    lowerText.includes("masuk") ||
    lowerText.includes("aplikasi") ||
    lowerText.includes("password")
  ) {
    return loginResponse;
  }

  return genericResponse;
}

function adaptDraftForTarget(draft: string, responseTarget: string) {
  if (responseTarget === "internal-note") {
    return `Catatan internal: pelanggan perlu ditangani dengan respons empatik dan pengecekan lanjutan.\n\nDraf eksternal:\n${draft}`;
  }

  if (responseTarget === "app-review") {
    return draft.replace(
      "silakan kirim detail kode booking atau nomor tiket melalui DM",
      "silakan hubungi kanal bantuan resmi kami dengan detail kendala",
    );
  }

  return draft;
}
