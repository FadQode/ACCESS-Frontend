import {
  Activity,
  ClipboardCheck,
  Headphones,
  ShieldCheck,
  User,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  FollowUpTicket,
  FollowUpTicketActivity,
} from "../model/ticket.types";
import { CATEGORY_LABELS } from "./TicketCard";

interface TicketAssistPanelProps {
  ticket: FollowUpTicket;
  onClose: () => void;
}

export function TicketAssistPanel({ onClose, ticket }: TicketAssistPanelProps) {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[var(--rail-border)] bg-[var(--surface-panel)] xl:w-[300px] xl:border-l xl:border-t-0">
      <header className="flex items-center gap-2 border-b border-[var(--rail-border)] px-4 py-3">
        <ShieldCheck
          aria-hidden="true"
          className="text-[var(--signal-blue)]"
          size={16}
        />
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-[var(--rail-ink)]">
            Konteks tiket
          </h2>
          <p className="text-[10px] text-[var(--text-muted)]">
            Metadata dan riwayat aktivitas
          </p>
        </div>
        <button
          aria-label="Tutup konteks tiket"
          className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={14} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <MetaCard
          icon={<User aria-hidden="true" size={15} />}
          title="Pelanggan"
        >
          <ActorTag actor="Pelanggan eksternal" actorRole="customer" />
          <InfoRow label="Nama" value={ticket.customerName} />
          <InfoRow label="Handle" value={ticket.username} />
          <InfoRow
            label="Sumber"
            value={`${ticket.sourceLabel} · ${ticket.sourceType}`}
          />
        </MetaCard>

        <MetaCard
          icon={<ClipboardCheck aria-hidden="true" size={15} />}
          title="Keluhan"
        >
          <ActorTag actor={ticket.sourceLabel} actorRole="platform" />
          <InfoRow label="Kategori" value={CATEGORY_LABELS[ticket.category]} />
          <InfoRow label="Rute" value={ticket.route ?? "Eksternal"} />
          <InfoRow label="Dikirim" value={ticket.submittedAt} />
        </MetaCard>

        <MetaCard
          icon={<ShieldCheck aria-hidden="true" size={15} />}
          title="Tindakan"
        >
          <ActorTag
            actor={
              ticket.managerAction.managerName
                ? `Manajer: ${ticket.managerAction.managerName}`
                : "Antrean manajer"
            }
            actorRole="manager"
          />
          <InfoRow
            label="Status"
            value={
              ticket.managerAction.status === "completed"
                ? "Tindakan disetujui"
                : "Menunggu manajer"
            }
          />
          {ticket.managerAction.managerName ? (
            <InfoRow label="Manajer" value={ticket.managerAction.managerName} />
          ) : null}
          {ticket.managerAction.completedAt ? (
            <InfoRow label="Waktu" value={ticket.managerAction.completedAt} />
          ) : null}
          <div className="mt-2 space-y-1.5">
            {ticket.managerAction.references.map((reference) => (
              <p
                className="rounded-md bg-[var(--background)] p-2 text-[11px] leading-5 text-[var(--text-muted)]"
                key={reference.referenceLinkId}
              >
                <span className="font-semibold text-[var(--rail-ink)]">
                  {reference.title}
                </span>
                <br />
                {reference.note ??
                  reference.snapshotText ??
                  reference.usageType}
              </p>
            ))}
          </div>
        </MetaCard>

        <MetaCard
          icon={<Activity aria-hidden="true" size={15} />}
          title="Aktivitas"
        >
          <div className="space-y-2">
            {ticket.activityLog.map((item) => (
              <ActivityItem item={item} key={item.id} />
            ))}
          </div>
        </MetaCard>
      </div>
    </aside>
  );
}

function MetaCard({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--rail-border)] bg-[var(--background)] px-2.5 py-2 text-[var(--text-muted)]">
        {icon}
        <h3 className="text-[11px] font-semibold text-[var(--rail-ink)]">
          {title}
        </h3>
      </div>
      <div className="p-2.5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 flex items-start justify-between gap-2 last:mb-0">
      <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="text-right text-[11px] font-semibold leading-5 text-[var(--rail-ink)]">
        {value}
      </span>
    </div>
  );
}

function ActivityItem({ item }: { item: FollowUpTicketActivity }) {
  const actorRole = item.actorType ?? inferActorType(item.actor);

  return (
    <div className="flex gap-2">
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${activityToneClass(
          item.tone ?? "neutral",
        )}`}
      />
      <div className="min-w-0">
        <ActorTag actor={item.actor} actorRole={actorRole} />
        <p className="text-[11px] leading-4 text-[var(--text-muted)]">
          {item.label}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">
          {item.time}
        </p>
      </div>
    </div>
  );
}

function ActorTag({
  actor,
  actorRole,
}: {
  actor: string;
  actorRole: NonNullable<FollowUpTicketActivity["actorType"]>;
}) {
  const style = actorTagStyle(actorRole);
  const Icon = style.icon;

  return (
    <span
      className={`mb-1 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.className}`}
    >
      <Icon aria-hidden="true" className="shrink-0" size={11} />
      <span className="truncate">
        {style.label}: {actor}
      </span>
    </span>
  );
}

function inferActorType(
  actor: string,
): NonNullable<FollowUpTicketActivity["actorType"]> {
  if (actor.startsWith("Mgr.")) {
    return "manager";
  }
  if (actor === "System" || actor === "Sistem") {
    return "system";
  }
  return "agent";
}

function actorTagStyle(role: NonNullable<FollowUpTicketActivity["actorType"]>) {
  const styles: Record<
    NonNullable<FollowUpTicketActivity["actorType"]>,
    { className: string; icon: typeof UserRound; label: string }
  > = {
    agent: {
      className:
        "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
      icon: Headphones,
      label: "Agen",
    },
    customer: {
      className:
        "border-[var(--rail-border)] bg-[var(--background)] text-[var(--rail-ink)]",
      icon: UserRound,
      label: "Pelanggan",
    },
    internal: {
      className:
        "border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
      icon: Wrench,
      label: "Internal",
    },
    manager: {
      className:
        "border-[var(--signal-green)] bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
      icon: ShieldCheck,
      label: "Manajer",
    },
    platform: {
      className:
        "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)]",
      icon: ClipboardCheck,
      label: "Platform",
    },
    system: {
      className:
        "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)]",
      icon: Activity,
      label: "Sistem",
    },
  };

  return styles[role];
}

function activityToneClass(tone: NonNullable<FollowUpTicketActivity["tone"]>) {
  const classes: Record<NonNullable<FollowUpTicketActivity["tone"]>, string> = {
    danger: "bg-[var(--signal-red)]",
    neutral: "bg-[var(--text-tertiary)]",
    success: "bg-[var(--signal-green)]",
    warning: "bg-[var(--signal-amber)]",
  };

  return classes[tone];
}
