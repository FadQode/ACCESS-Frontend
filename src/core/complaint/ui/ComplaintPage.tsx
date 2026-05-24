"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  HelpCircle,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import {
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  useState,
} from "react";

type ComplaintCategory =
  | ""
  | "delay"
  | "refund"
  | "cancellation"
  | "reschedule"
  | "payment"
  | "app-login"
  | "facility"
  | "lost-item"
  | "seat-schedule"
  | "other";

type FieldErrors = Partial<{
  category: string;
  complaint: string;
  contact: string;
  name: string;
}>;

const categoryOptions: Array<{
  label: string;
  value: Exclude<ComplaintCategory, "">;
}> = [
  { label: "Delay / keterlambatan", value: "delay" },
  { label: "Refund / pengembalian dana", value: "refund" },
  { label: "Pembatalan tiket", value: "cancellation" },
  { label: "Jadwal ulang", value: "reschedule" },
  { label: "Pembayaran", value: "payment" },
  { label: "Aplikasi atau login", value: "app-login" },
  { label: "Fasilitas perjalanan", value: "facility" },
  { label: "Barang tertinggal", value: "lost-item" },
  { label: "Kursi atau jadwal tidak sesuai", value: "seat-schedule" },
  { label: "Lainnya", value: "other" },
];

const categoryHints: Record<Exclude<ComplaintCategory, "">, string> = {
  "app-login":
    "Jika ada, jelaskan perangkat yang digunakan dan pesan error yang muncul.",
  cancellation: "Jika ada, sertakan kode booking dan alasan pembatalan.",
  delay:
    "Jika ada, sertakan tanggal perjalanan, rute, dan perkiraan waktu keterlambatan.",
  facility:
    "Jika ada, sertakan nomor kereta, gerbong, atau fasilitas yang bermasalah.",
  "lost-item":
    "Jika ada, jelaskan barang yang tertinggal dan detail perjalanan.",
  other:
    "Ceritakan masalah Anda dengan kata-kata sendiri. Tim kami akan membantu mengarahkan.",
  payment: "Jika ada, sertakan waktu transaksi dan status pembayaran.",
  refund: "Jika ada, sertakan tanggal pengajuan refund dan metode pembayaran.",
  reschedule: "Jika ada, sertakan jadwal awal dan jadwal baru yang diinginkan.",
  "seat-schedule": "Jika ada, sertakan nomor kursi, jadwal, atau kode booking.",
};

const inputClassName =
  "mt-2 min-h-12 w-full rounded-2xl border border-[var(--rail-border)] bg-white px-4 text-sm text-[var(--rail-ink)] shadow-sm outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-4 focus:ring-[var(--signal-blue-soft)]";

const labelClassName = "text-sm font-semibold text-[var(--rail-ink)]";

export function ComplaintPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("");
  const [otherCategory, setOtherCategory] = useState("");
  const [complaint, setComplaint] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const firstName = name.trim().split(/\s+/)[0] || "Bapak/Ibu";

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Mohon isi nama Anda.";
    }

    if (!contact.trim()) {
      nextErrors.contact =
        "Mohon isi email atau nomor telepon agar kami bisa menghubungi Anda.";
    }

    if (!category) {
      nextErrors.category = "Mohon pilih jenis keluhan yang paling sesuai.";
    }

    if (complaint.trim().length < 10) {
      nextErrors.complaint =
        "Mohon ceritakan keluhan Anda minimal 10 karakter.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      setReferenceNumber(`ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ behavior: "smooth", top: 0 });
    }, 600);
  };

  const handleSubmitAnother = () => {
    setName("");
    setContact("");
    setCategory("");
    setOtherCategory("");
    setComplaint("");
    setErrors({});
    setReferenceNumber("");
    setIsSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <ComplaintNavbar />

      {!isSubmitted ? (
        <>
          <section
            className="relative overflow-hidden px-5 py-12 sm:px-6 md:py-16"
            id="complaint-form"
          >
            <PageTexture />
            <div className="relative mx-auto flex max-w-5xl flex-col items-center">
              <ComplaintHero />
              <ComplaintTrustPoints />
              <ComplaintFormCard
                category={category}
                complaint={complaint}
                contact={contact}
                errors={errors}
                isSubmitting={isSubmitting}
                name={name}
                onCategoryChange={(value) => {
                  setCategory(value);
                  setErrors((current) => ({ ...current, category: undefined }));
                }}
                onComplaintChange={(value) => {
                  setComplaint(value);
                  setErrors((current) => ({
                    ...current,
                    complaint: undefined,
                  }));
                }}
                onContactChange={(value) => {
                  setContact(value);
                  setErrors((current) => ({ ...current, contact: undefined }));
                }}
                onNameChange={(value) => {
                  setName(value);
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                onOtherCategoryChange={setOtherCategory}
                onSubmit={handleSubmit}
                otherCategory={otherCategory}
              />
            </div>
          </section>

          <ComplaintProcessSection />
          <ComplaintPromiseSection />
          <ComplaintFaqSection />
        </>
      ) : (
        <>
          <ComplaintSuccessSection
            contact={contact}
            firstName={firstName}
            onSubmitAnother={handleSubmitAnother}
            referenceNumber={referenceNumber}
          />
          <ComplaintProcessSection />
        </>
      )}

      <ComplaintFooter />
    </main>
  );
}

function ComplaintNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rail-border)] bg-[var(--surface-panel)]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <a className="flex min-w-0 items-center gap-3" href="/complaint">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--signal-amber)] text-sm font-black text-[var(--rail-ink)]">
            A
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-none text-[var(--rail-ink)]">
              ACCESS
            </span>
            <span className="mt-1 block text-xs text-[var(--text-muted)]">
              Layanan Pelanggan
            </span>
          </span>
        </a>

        <nav
          aria-label="Navigasi halaman keluhan"
          className="hidden items-center gap-6 text-sm font-medium text-[var(--text-muted)] md:flex"
        >
          <button
            className="transition hover:text-[var(--rail-ink)]"
            onClick={(event) => scrollToSection(event, "cara-kerja")}
            type="button"
          >
            Cara Kerja
          </button>
          <button
            className="transition hover:text-[var(--rail-ink)]"
            onClick={(event) => scrollToSection(event, "komitmen")}
            type="button"
          >
            Komitmen
          </button>
          <button
            className="transition hover:text-[var(--rail-ink)]"
            onClick={(event) => scrollToSection(event, "faq")}
            type="button"
          >
            FAQ
          </button>
        </nav>

        <button
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-[var(--signal-blue)] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--rail-ink)]"
          onClick={(event) => scrollToSection(event, "complaint-form")}
          type="button"
        >
          Kirim Keluhan
        </button>
      </div>
    </header>
  );
}

function ComplaintHero() {
  return (
    <div className="max-w-3xl text-center">
      <p className="inline-flex rounded-full border border-[var(--rail-border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--signal-blue)] shadow-sm">
        Keluhan publik tanpa akun
      </p>
      <h1 className="mt-6 text-4xl font-semibold leading-tight text-[var(--rail-ink)] sm:text-5xl">
        Ceritakan apa yang terjadi
      </h1>
      <p className="mt-4 text-base leading-8 text-[var(--text-muted)] sm:text-lg">
        Kami akan membantu meninjau keluhan Anda dan menghubungi Anda kembali
        secepatnya.
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
        Tidak perlu formal. Cukup jelaskan masalah Anda dengan kata-kata
        sendiri.
      </p>
    </div>
  );
}

function ComplaintTrustPoints() {
  return (
    <div className="mt-7 flex max-w-3xl flex-wrap justify-center gap-3">
      <TrustPill icon={<UserRoundCheck aria-hidden="true" size={16} />}>
        Tidak perlu akun
      </TrustPill>
      <TrustPill icon={<Clock3 aria-hidden="true" size={16} />}>
        Kurang dari 1 menit
      </TrustPill>
      <TrustPill icon={<FileText aria-hidden="true" size={16} />}>
        Dapat nomor referensi
      </TrustPill>
      <TrustPill icon={<LockKeyhole aria-hidden="true" size={16} />}>
        Kontak hanya untuk balasan
      </TrustPill>
    </div>
  );
}

function ComplaintFormCard({
  category,
  complaint,
  contact,
  errors,
  isSubmitting,
  name,
  onCategoryChange,
  onComplaintChange,
  onContactChange,
  onNameChange,
  onOtherCategoryChange,
  onSubmit,
  otherCategory,
}: {
  category: ComplaintCategory;
  complaint: string;
  contact: string;
  errors: FieldErrors;
  isSubmitting: boolean;
  name: string;
  onCategoryChange: (category: ComplaintCategory) => void;
  onComplaintChange: (value: string) => void;
  onContactChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onOtherCategoryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  otherCategory: string;
}) {
  const categoryHint = category
    ? categoryHints[category as Exclude<ComplaintCategory, "">]
    : "";

  return (
    <section
      aria-labelledby="complaint-form-title"
      className="mt-8 w-full max-w-[640px] overflow-hidden rounded-[28px] border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-ops)]"
    >
      <div className="border-b border-[var(--rail-border)] bg-white px-5 py-5 sm:px-8 sm:py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--signal-blue)]">
          Form Keluhan
        </p>
        <h2
          className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]"
          id="complaint-form-title"
        >
          Isi data singkat berikut agar tim kami bisa membantu.
        </h2>
      </div>

      <form className="space-y-6 px-5 py-6 sm:px-8 sm:py-8" onSubmit={onSubmit}>
        <div>
          <label className={labelClassName} htmlFor="complaint-name">
            Nama Anda
          </label>
          <input
            aria-describedby={errors.name ? "complaint-name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className={inputClassName}
            id="complaint-name"
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Contoh: Siti Nuraini"
            type="text"
            value={name}
          />
          <FieldError id="complaint-name-error" message={errors.name} />
        </div>

        <div>
          <label className={labelClassName} htmlFor="complaint-contact">
            Email atau nomor telepon
          </label>
          <input
            aria-describedby={
              errors.contact
                ? "complaint-contact-help complaint-contact-error"
                : "complaint-contact-help"
            }
            aria-invalid={Boolean(errors.contact)}
            className={inputClassName}
            id="complaint-contact"
            onChange={(event) => onContactChange(event.target.value)}
            placeholder="Agar kami bisa menghubungi Anda kembali"
            type="text"
            value={contact}
          />
          <p
            className="mt-2 text-xs leading-5 text-[var(--text-muted)]"
            id="complaint-contact-help"
          >
            Kami hanya menggunakan kontak ini untuk menanggapi keluhan Anda.
          </p>
          <FieldError id="complaint-contact-error" message={errors.contact} />
        </div>

        <div>
          <label className={labelClassName} htmlFor="complaint-category">
            Keluhan ini tentang apa?
          </label>
          <div className="relative mt-2">
            <select
              aria-describedby={
                errors.category
                  ? "complaint-category-help complaint-category-error"
                  : "complaint-category-help"
              }
              aria-invalid={Boolean(errors.category)}
              className="min-h-12 w-full appearance-none rounded-2xl border border-[var(--rail-border)] bg-white px-4 pr-12 text-sm text-[var(--rail-ink)] shadow-sm outline-none transition focus:border-[var(--signal-blue)] focus:ring-4 focus:ring-[var(--signal-blue-soft)]"
              id="complaint-category"
              onChange={(event) =>
                onCategoryChange(event.target.value as ComplaintCategory)
              }
              value={category}
            >
              <option value="">Pilih jenis keluhan</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              size={18}
            />
          </div>
          <p
            className="mt-2 text-xs leading-5 text-[var(--text-muted)]"
            id="complaint-category-help"
          >
            Pilih yang paling mendekati. Tim kami tetap akan meninjau detail
            keluhan Anda.
          </p>
          <FieldError id="complaint-category-error" message={errors.category} />
        </div>

        {category === "other" ? (
          <div>
            <label
              className={labelClassName}
              htmlFor="complaint-other-category"
            >
              Jenis keluhan lainnya
            </label>
            <input
              className={inputClassName}
              id="complaint-other-category"
              onChange={(event) => onOtherCategoryChange(event.target.value)}
              placeholder="Contoh: petugas, kebersihan, informasi stasiun"
              type="text"
              value={otherCategory}
            />
          </div>
        ) : null}

        <div>
          <label className={labelClassName} htmlFor="complaint-text">
            Apa yang terjadi?
          </label>
          {categoryHint ? (
            <p className="mt-2 rounded-2xl bg-[var(--signal-blue-soft)] px-4 py-3 text-sm leading-6 text-[var(--rail-ink)]">
              {categoryHint}
            </p>
          ) : null}
          <textarea
            aria-describedby={
              errors.complaint
                ? "complaint-text-help complaint-text-error"
                : "complaint-text-help"
            }
            aria-invalid={Boolean(errors.complaint)}
            className={`${inputClassName} min-h-[130px] resize-y py-3 leading-6 sm:min-h-[170px]`}
            id="complaint-text"
            onChange={(event) => onComplaintChange(event.target.value)}
            placeholder="Ceritakan pengalaman Anda dengan kata-kata sendiri. Tidak perlu formal."
            value={complaint}
          />
          <p
            className="mt-2 text-xs leading-5 text-[var(--text-muted)]"
            id="complaint-text-help"
          >
            Jika ada, sertakan tanggal perjalanan, rute, atau kode booking.
          </p>
          <FieldError id="complaint-text-error" message={errors.complaint} />
        </div>

        <button
          className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--signal-blue)] px-5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(23,95,138,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--rail-ink)] focus:outline focus:outline-2 focus:outline-[var(--signal-blue)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Mengirim..." : "Kirim keluhan"}
          <ArrowRight
            aria-hidden="true"
            className="transition group-hover:translate-x-1"
            size={18}
          />
        </button>

        <div className="flex items-start gap-3 rounded-2xl bg-[var(--signal-green-soft)] p-4 text-sm leading-6 text-[var(--signal-green-dark)]">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={18}
          />
          <p>
            Kami hanya menggunakan kontak ini untuk menanggapi keluhan Anda.
          </p>
        </div>
      </form>
    </section>
  );
}

function ComplaintProcessSection() {
  return (
    <section
      className="scroll-mt-24 border-y border-[var(--rail-border)] bg-[var(--surface-panel)] px-5 py-14 sm:px-6 lg:py-20"
      id="cara-kerja"
    >
      <SectionHeading
        subtitle="Setelah dikirim, keluhan Anda akan masuk ke alur kerja tim support agar dapat ditinjau dan ditindaklanjuti."
        title="Bagaimana keluhan Anda diproses?"
      />
      <div className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProcessCard
          description="Anda akan mendapatkan nomor referensi sebagai bukti bahwa keluhan sudah masuk."
          number="1"
          title="Keluhan diterima"
        />
        <ProcessCard
          description="Tim support membaca detail keluhan dan memeriksa konteks yang relevan."
          number="2"
          title="Ditinjau oleh tim support"
        />
        <ProcessCard
          description="Agen menyiapkan respons berdasarkan situasi dan kebijakan yang berlaku."
          number="3"
          title="Respons disiapkan"
        />
        <ProcessCard
          description="Balasan dikirim melalui email atau nomor telepon yang Anda berikan."
          number="4"
          title="Anda dihubungi kembali"
        />
      </div>
    </section>
  );
}

function ComplaintPromiseSection() {
  return (
    <section className="scroll-mt-24 px-5 py-14 sm:px-6 lg:py-20" id="komitmen">
      <SectionHeading
        subtitle="Halaman ini dibuat singkat, jelas, dan aman agar keluhan dapat dikirim tanpa proses yang melelahkan."
        title="Kami menangani keluhan dengan jelas dan hati-hati"
      />
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
        <PromiseCard
          icon={<UserRoundCheck aria-hidden="true" size={22} />}
          text="Anda dapat mengirim keluhan tanpa login atau membuat akun terlebih dahulu."
          title="Tidak perlu akun"
        />
        <PromiseCard
          icon={<LockKeyhole aria-hidden="true" size={22} />}
          text="Email atau nomor telepon hanya digunakan untuk menanggapi keluhan Anda."
          title="Kontak digunakan seperlunya"
        />
        <PromiseCard
          icon={<MessageSquareText aria-hidden="true" size={22} />}
          text="Keluhan Anda akan dibaca dan ditangani oleh agen support, bukan hanya sistem otomatis."
          title="Ditinjau oleh tim support"
        />
        <PromiseCard
          icon={<ShieldCheck aria-hidden="true" size={22} />}
          text="Respons disiapkan berdasarkan situasi dan kebijakan penanganan yang berlaku."
          title="Mengikuti kebijakan layanan"
        />
      </div>
    </section>
  );
}

function ComplaintFaqSection() {
  return (
    <section
      className="scroll-mt-24 border-y border-[var(--rail-border)] bg-[var(--surface-panel)] px-5 py-14 sm:px-6 lg:py-20"
      id="faq"
    >
      <SectionHeading
        subtitle="Jawaban singkat untuk hal yang paling sering ditanyakan sebelum mengirim keluhan."
        title="Pertanyaan umum"
      />
      <div className="mx-auto mt-8 grid max-w-3xl gap-3">
        <FaqItem
          answer="Tidak. Anda dapat mengirim keluhan tanpa membuat akun."
          question="Apakah saya harus punya akun?"
        />
        <FaqItem
          answer="Biasanya dalam 1 hari kerja, tergantung jenis keluhan dan data yang perlu diperiksa."
          question="Kapan saya akan mendapat balasan?"
        />
        <FaqItem
          answer="Ceritakan masalah yang Anda alami. Jika ada, sertakan tanggal perjalanan, rute, kode booking, atau detail lain yang membantu."
          question="Apa yang harus saya tulis di keluhan?"
        />
        <FaqItem
          answer="Kontak Anda digunakan untuk mengirim balasan terkait keluhan ini."
          question="Apakah kontak saya aman?"
        />
        <FaqItem
          answer="Tidak masalah. Tim support tetap akan meninjau isi keluhan Anda dan mengarahkan ke kategori yang sesuai."
          question="Bagaimana jika saya memilih kategori yang kurang tepat?"
        />
      </div>
    </section>
  );
}

function ComplaintSuccessSection({
  contact,
  firstName,
  onSubmitAnother,
  referenceNumber,
}: {
  contact: string;
  firstName: string;
  onSubmitAnother: () => void;
  referenceNumber: string;
}) {
  return (
    <section className="px-5 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-[640px] overflow-hidden rounded-[28px] border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-ops)]">
        <div className="border-b border-[var(--rail-border)] bg-white px-5 py-6 sm:px-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--signal-green-soft)] text-[var(--signal-green)]">
            <CheckCircle2 aria-hidden="true" size={30} />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--signal-green)]">
            Keluhan diterima
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--rail-ink)] sm:text-4xl">
            Terima kasih, {firstName}.
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
            Kami sudah menerima keluhan Anda dan akan menghubungi Anda
            secepatnya.
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="rounded-[24px] border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--signal-amber-dark)]">
              Nomor referensi Anda
            </p>
            <p className="mt-3 break-all font-mono text-3xl font-semibold text-[var(--rail-ink)]">
              {referenceNumber}
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--rail-ink)]">
              Kami akan menghubungi Anda melalui {contact}, biasanya dalam 1
              hari kerja.
            </p>
          </div>

          <button
            className="mt-7 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[var(--signal-blue)] px-5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--rail-ink)]"
            onClick={onSubmitAnother}
            type="button"
          >
            Kirim keluhan lain
          </button>
        </div>
      </div>
    </section>
  );
}

function ComplaintFooter() {
  return (
    <footer className="border-t border-[var(--rail-border)] bg-[var(--rail-ink)] px-5 py-8 text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">ACCESS</p>
          <p className="mt-1 text-xs text-[var(--text-on-dark)]">
            Layanan Pelanggan
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--text-on-dark)]">
          <span>(c) 2026 ACCESS. Semua hak dilindungi.</span>
          <button className="transition hover:text-white" type="button">
            Kebijakan Privasi
          </button>
          <button className="transition hover:text-white" type="button">
            Bantuan
          </button>
          <button className="transition hover:text-white" type="button">
            Kontak
          </button>
        </div>
      </div>
    </footer>
  );
}

function TrustPill({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-white px-4 text-sm font-medium text-[var(--rail-ink)] shadow-sm">
      <span className="text-[var(--signal-blue)]">{icon}</span>
      {children}
    </span>
  );
}

function SectionHeading({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl font-semibold leading-tight text-[var(--rail-ink)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function ProcessCard({
  description,
  number,
  title,
}: {
  description: string;
  number: string;
  title: string;
}) {
  return (
    <article className="rounded-[24px] border border-[var(--rail-border)] bg-white p-5 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--signal-blue-soft)] text-sm font-semibold text-[var(--signal-blue)]">
        {number}
      </span>
      <h3 className="mt-5 text-base font-semibold text-[var(--rail-ink)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {description}
      </p>
    </article>
  );
}

function PromiseCard({
  icon,
  text,
  title,
}: {
  icon: ReactNode;
  text: string;
  title: string;
}) {
  return (
    <article className="rounded-[24px] border border-[var(--rail-border)] bg-white p-5 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-[var(--rail-ink)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{text}</p>
    </article>
  );
}

function FaqItem({ answer, question }: { answer: string; question: string }) {
  return (
    <details className="group rounded-2xl border border-[var(--rail-border)] bg-white p-5 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--rail-ink)]">
        <span>{question}</span>
        <HelpCircle
          aria-hidden="true"
          className="shrink-0 text-[var(--signal-blue)] transition group-open:rotate-45"
          size={18}
        />
      </summary>
      <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
        {answer}
      </p>
    </details>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-xs font-medium text-[var(--signal-red)]" id={id}>
      {message}
    </p>
  );
}

function PageTexture() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,35,31,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(19,35,31,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--signal-amber-soft)] opacity-50 blur-3xl" />
    </div>
  );
}

function scrollToSection(
  event: MouseEvent<HTMLButtonElement>,
  sectionId: string,
) {
  event.preventDefault();

  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
