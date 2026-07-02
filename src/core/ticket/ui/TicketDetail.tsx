import {
  Clipboard,
  ExternalLink,
  Headphones,
  Send,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import type { FollowUpTicket } from "../model/ticket.types";
import { CATEGORY_LABELS, CategoryBadge, StatusBadge } from "./TicketCard";

type ActorRole = "customer" | "agent" | "manager" | "internal" | "platform";

interface TicketDetailProps {
  ticket: FollowUpTicket;
  closureDraft: string;
  canPerformFinalClosure: boolean;
  hasCopiedClosure: boolean;
  isAdminFinalClosure: boolean;
  isFinalClosurePending: boolean;
  onClosureDraftChange: (value: string) => void;
  onCopyClosureAndClose: () => void;
}

export function TicketDetail({
  closureDraft,
  canPerformFinalClosure,
  hasCopiedClosure,
  isAdminFinalClosure,
  isFinalClosurePending,
  onClosureDraftChange,
  onCopyClosureAndClose,
  ticket,
}: TicketDetailProps) {
  const canClose =
    ticket.status === "ready_to_notify" &&
    closureDraft.trim().length >= 5 &&
    canPerformFinalClosure &&
    !isFinalClosurePending;

  return (
    <section className="flex min-h-[700px] min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)] xl:min-h-0">
      <header className="shrink-0 border-b border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--signal-blue)] text-xs font-semibold text-white">
              {ticket.customerInitials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-[var(--rail-ink)]">
                {ticket.customerName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <StatusBadge status={ticket.status} />
                <CategoryBadge category={ticket.category} />
                <span>
                  {ticket.sourceLabel} - {ticket.username}
                </span>
                <span>{ticket.displayId}</span>
              </div>
            </div>
          </div>

          {ticket.externalUrl ? (
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              type="button"
            >
              <ExternalLink aria-hidden="true" size={14} />
              Lihat di {ticket.sourceLabel}
            </button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <OriginalComplaintCard ticket={ticket} />
          <PreviousSafeReplyCard ticket={ticket} />
          <ManagerActionCard ticket={ticket} />
          <ClosureMessageCard
            canClose={canClose}
            closureDraft={closureDraft}
            canPerformFinalClosure={canPerformFinalClosure}
            hasCopiedClosure={hasCopiedClosure}
            isAdminFinalClosure={isAdminFinalClosure}
            isFinalClosurePending={isFinalClosurePending}
            onChange={onClosureDraftChange}
            onCopyClosureAndClose={onCopyClosureAndClose}
            ticket={ticket}
          />
        </div>
      </div>
    </section>
  );
}

function OriginalComplaintCard({ ticket }: { ticket: FollowUpTicket }) {
  return (
    <WorkflowCard
      actorName={`${ticket.customerName} (${ticket.username})`}
      eyebrow={`${ticket.sourceLabel} - ${ticket.sourceType}`}
      actorRole="customer"
      title="Keluhan pelanggan"
    >
      <RoleMessage
        label="Ditulis pelanggan"
        quote
        actorRole="customer"
        text={ticket.originalComplaint}
      />
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
        <MetaTile label="Dikirim" value={ticket.submittedAt} />
        <MetaTile label="Rute / isu" value={ticket.route ?? "Eksternal"} />
        <MetaTile
          label="Kategori terdeteksi"
          value={CATEGORY_LABELS[ticket.category]}
        />
      </div>
    </WorkflowCard>
  );
}

function PreviousSafeReplyCard({ ticket }: { ticket: FollowUpTicket }) {
  return (
    <WorkflowCard
      actorName={ticket.safeReplyBy ?? "Agen bertugas"}
      eyebrow={`${ticket.sourceLabel} - ${ticket.safeReplyCopiedAt ?? "Disalin"}`}
      actorRole="agent"
      title="Balasan awal agen"
    >
      <RoleMessage
        label="Sudah disalin ke kanal eksternal"
        quote
        actorRole="agent"
        text={ticket.safeReplyText ?? "Belum ada balasan awal yang tercatat."}
      />
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {ticket.safeReplyCopiedAt ?? "Waktu salin belum tercatat"}
      </p>
    </WorkflowCard>
  );
}

function ManagerActionCard({ ticket }: { ticket: FollowUpTicket }) {
  const actionCompleted = ticket.managerAction.status === "completed";

  return (
    <WorkflowCard
      actorName={ticket.managerAction.managerName ?? "Antrean manajer"}
      eyebrow={
        actionCompleted
          ? `${ticket.managerAction.completedAt} - ${ticket.managerAction.managerName}`
          : "Menunggu keputusan internal"
      }
      actorRole="manager"
      title={
        actionCompleted ? "Arahan manajer selesai" : "Menunggu arahan manajer"
      }
    >
      {actionCompleted ? (
        <>
          <RoleMessage
            label="Tindakan dilakukan - catatan internal"
            actorRole="manager"
            text={ticket.managerAction.actionTaken ?? "Arahan selesai."}
          />
          <div className="mt-3">
            <RoleMessage
              label="Pesan penutup - saran balasan pelanggan"
              actorRole="agent"
              quote
              text={
                ticket.managerAction.closureDraft ??
                "Saran balasan akhir belum tersedia."
              }
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ticket.managerAction.references.map((reference) => (
              <span
                className="rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)]"
                key={reference.id}
              >
                {reference.title}
              </span>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-[var(--rail-ink)]">
              <Wrench
                aria-hidden="true"
                className="text-[var(--signal-amber)]"
                size={14}
              />
              Hasil tim internal
            </div>
            <p className="text-xs leading-6 text-[var(--text-muted)]">
              Tindakan yang dilakukan dipakai sebagai catatan internal. Pesan
              penutup sudah dimuat sebagai draft balasan akhir di bawah.
            </p>
          </div>
        </>
      ) : (
        <RoleMessage
          label="Status internal"
          actorRole="internal"
          text="Menunggu arahan manager. Balasan akhir belum tersedia."
        />
      )}
    </WorkflowCard>
  );
}

function ClosureMessageCard({
  canClose,
  closureDraft,
  canPerformFinalClosure,
  hasCopiedClosure,
  isAdminFinalClosure,
  isFinalClosurePending,
  onChange,
  onCopyClosureAndClose,
  ticket,
}: {
  canClose: boolean;
  closureDraft: string;
  canPerformFinalClosure: boolean;
  hasCopiedClosure: boolean;
  isAdminFinalClosure: boolean;
  isFinalClosurePending: boolean;
  onChange: (value: string) => void;
  onCopyClosureAndClose: () => void;
  ticket: FollowUpTicket;
}) {
  if (ticket.status === "waiting_manager" || ticket.status === "escalated") {
    return (
      <WorkflowCard
        actorName="Manajer / tim internal"
        eyebrow="Belum ada balasan akhir"
        actorRole="internal"
        title="Kabari pelanggan"
      >
        <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-4">
          <RoleMessage
            label="Menunggu arahan"
            actorRole="internal"
            text="Balasan akhir bisa dibuat setelah manager menyelesaikan tindak lanjut."
          />
        </div>
      </WorkflowCard>
    );
  }

  return (
    <WorkflowCard
      actorName={ticket.closedBy ?? "Agen bertugas"}
      eyebrow={
        ticket.status === "closed"
          ? (ticket.closedAt ?? "Ditutup")
          : ticket.sourceLabel
      }
      actorRole="agent"
      title="Balasan akhir agen"
    >
      {hasCopiedClosure ? (
        <div className="mb-3 rounded-lg border border-[var(--signal-green)] bg-[var(--signal-green-soft)] p-3 text-sm text-[var(--signal-green-dark)]">
          Balasan akhir sudah disalin dan backend mengonfirmasi ticket ditutup.
          Tempel balasan akhir di {ticket.sourceLabel} jika percakapan eksternal
          masih membutuhkannya.
        </div>
      ) : null}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <ActorBadge actorRole="agent" text="Agen meninjau dan menyalin" />
        <ActorBadge
          actorRole="platform"
          text={`Tujuan: ${ticket.sourceLabel}`}
        />
      </div>
      <div className="mb-2 rounded-lg border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-3 py-2 text-xs leading-5 text-[var(--signal-blue)]">
        Draft di bawah berasal dari closure message manager. Agen bisa meninjau,
        menyesuaikan, lalu menyalinnya untuk pelanggan.
      </div>
      {isAdminFinalClosure ? (
        <div className="mb-2 rounded-lg border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] px-3 py-2 text-xs leading-5 text-[var(--signal-amber-dark)]">
          Mode admin/tester aktif. Aksi ini tetap akan dicatat backend sebagai
          final closure.
        </div>
      ) : null}
      {!canPerformFinalClosure ? (
        <div className="mb-2 rounded-lg border border-[var(--signal-red)] bg-[var(--signal-red-soft)] px-3 py-2 text-xs leading-5 text-[var(--signal-red-dark)]">
          Manager tidak dapat melakukan final closure agent.
        </div>
      ) : null}
      <textarea
        className="min-h-[180px] w-full resize-none rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-3 text-sm leading-7 text-[var(--rail-ink)] outline-none transition focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)] disabled:opacity-70"
        disabled={ticket.status === "closed"}
        onChange={(event) => onChange(event.target.value)}
        value={closureDraft}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          Sistem menyalin balasan lebih dulu, lalu menutup ticket hanya setelah
          backend mengonfirmasi complaint resolved.
        </span>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
          disabled={!canClose}
          onClick={onCopyClosureAndClose}
          type="button"
        >
          <Clipboard aria-hidden="true" size={14} />
          {isFinalClosurePending
            ? "Menandai selesai..."
            : ticket.status === "closed"
              ? "Tiket ditutup"
              : "Salin balasan & tandai selesai"}
        </button>
      </div>
    </WorkflowCard>
  );
}

function WorkflowCard({
  actorName,
  children,
  eyebrow,
  actorRole,
  title,
}: {
  actorName: string;
  children: ReactNode;
  eyebrow: string;
  actorRole: ActorRole;
  title: string;
}) {
  const style = actorRoleStyle(actorRole);
  const Icon = style.icon;

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-[var(--surface-panel)] shadow-[var(--shadow-soft)] ${style.border}`}
    >
      <div className={`h-1.5 ${style.bar}`} />
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <ActorBadge
              actorRole={actorRole}
              text={`${style.label}: ${actorName}`}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {eyebrow}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--rail-ink)]">
              {title}
            </h3>
          </div>
          <Icon aria-hidden="true" className={style.iconClass} size={17} />
        </div>
        {children}
      </div>
    </article>
  );
}

function RoleMessage({
  label,
  quote = false,
  actorRole,
  text,
}: {
  label: string;
  quote?: boolean;
  actorRole: ActorRole;
  text: string;
}) {
  const style = actorRoleStyle(actorRole);
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border p-3 ${style.message}`}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em]">
        <Icon aria-hidden="true" size={14} />
        {label}
      </div>
      <p className="text-sm leading-7 text-[var(--rail-ink)]">
        {quote ? `"${text}"` : text}
      </p>
    </div>
  );
}

function ActorBadge({
  actorRole,
  text,
}: {
  actorRole: ActorRole;
  text: string;
}) {
  const style = actorRoleStyle(actorRole);
  const Icon = style.icon;

  return (
    <span
      className={`mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${style.badge}`}
    >
      <Icon aria-hidden="true" className="shrink-0" size={12} />
      <span className="truncate">{text}</span>
    </span>
  );
}

function actorRoleStyle(actorRole: ActorRole) {
  const styles: Record<
    ActorRole,
    {
      badge: string;
      bar: string;
      border: string;
      icon: typeof UserRound;
      iconClass: string;
      label: string;
      message: string;
    }
  > = {
    agent: {
      badge:
        "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
      bar: "bg-[var(--signal-blue)]",
      border: "border-[var(--signal-blue)]",
      icon: Headphones,
      iconClass: "text-[var(--signal-blue)]",
      label: "Agen",
      message:
        "border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    },
    customer: {
      badge:
        "border-[var(--rail-border)] bg-[var(--background)] text-[var(--rail-ink)]",
      bar: "bg-[var(--rail-ink)]",
      border: "border-[var(--rail-border)]",
      icon: UserRound,
      iconClass: "text-[var(--rail-ink)]",
      label: "Pelanggan",
      message:
        "border-[var(--rail-border)] bg-[var(--background)] text-[var(--rail-ink)]",
    },
    internal: {
      badge:
        "border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
      bar: "bg-[var(--signal-amber)]",
      border: "border-[var(--signal-amber)]",
      icon: Wrench,
      iconClass: "text-[var(--signal-amber)]",
      label: "Internal",
      message:
        "border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    },
    manager: {
      badge:
        "border-[var(--signal-green)] bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
      bar: "bg-[var(--signal-green)]",
      border: "border-[var(--signal-green)]",
      icon: ShieldCheck,
      iconClass: "text-[var(--signal-green)]",
      label: "Manajer",
      message:
        "border-[var(--signal-green)] bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    },
    platform: {
      badge:
        "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)]",
      bar: "bg-[var(--text-tertiary)]",
      border: "border-[var(--rail-border)]",
      icon: Send,
      iconClass: "text-[var(--text-muted)]",
      label: "Platform",
      message:
        "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)]",
    },
  };

  return styles[actorRole];
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--background)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 font-semibold text-[var(--rail-ink)]">{value}</p>
    </div>
  );
}
