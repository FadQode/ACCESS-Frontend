"use client";

import {
  Archive,
  ArrowLeft,
  ExternalLink,
  FileText,
  Link2,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { ApiStateBoundary } from "@/core/components/feedback";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useCurrentUser } from "@/core/dashboard/hooks/use-current-user";
import { useUsers } from "@/core/dashboard/hooks/use-users";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import type { UserLookupItem } from "@/core/dashboard/model/api/users.api";
import type { AuthUser } from "@/core/dashboard/model/types/auth.types";
import { useReferenceDetail } from "../hooks/use-reference-detail";
import { useReferenceFileUrl } from "../hooks/use-reference-file-url";
import {
  getReferenceOwner,
  type ReferenceOwnerContext,
} from "../model/mappers/reference.mapper";
import {
  getCachedReferenceOwners,
  type ReferenceOwnerCache,
} from "../model/reference-owner-cache";
import type { ReferenceItem } from "../model/types/reference.types";

type ReferenceDashboardRole = "agent" | "manager";

export function ReferenceDetailPage({
  dashboardRole,
  referenceId,
}: {
  dashboardRole: ReferenceDashboardRole;
  referenceId: string;
}) {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data ?? sessionUser;
  const [cachedOwners, setCachedOwners] = useState<ReferenceOwnerCache>({});
  const referenceQuery = useReferenceDetail(referenceId);
  const usersQuery = useUsers(Boolean(currentUser));
  const fileUrlMutation = useReferenceFileUrl();
  const reference = referenceQuery.data;
  const referenceOwnerContext = useMemo(
    () => ({
      currentUser,
      ownersByReferenceId: cachedOwners,
      usersById: buildUserLookup(usersQuery.data ?? [], currentUser),
    }),
    [cachedOwners, currentUser, usersQuery.data],
  );
  const isAgentUnavailable =
    dashboardRole === "agent" && reference && reference.status !== "active";

  useEffect(() => {
    setCachedOwners(getCachedReferenceOwners());
  }, []);

  const openReference = async () => {
    if (!reference) {
      return;
    }

    if (reference.displayType === "link" && reference.url) {
      window.open(reference.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (reference.displayType === "file") {
      const fileUrl = await fileUrlMutation.mutateAsync(reference.id);
      window.open(fileUrl.signedUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole={dashboardRole}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole={dashboardRole}
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Detail referensi"
            userName={currentUser?.name ?? "User"}
          />

          <ApiStateBoundary
            emptyFallback={
              <ReferenceUnavailable dashboardRole={dashboardRole} />
            }
            errorMessage={getErrorMessage(referenceQuery.error)}
            isEmpty={!reference || Boolean(isAgentUnavailable)}
            isError={referenceQuery.isError}
            isLoading={referenceQuery.isLoading}
            loadingFallback={
              <div className="h-80 animate-pulse rounded-xl bg-white" />
            }
            onRetry={() => {
              void referenceQuery.refetch();
            }}
          >
            {reference ? (
              <ReferenceDetailCard
                dashboardRole={dashboardRole}
                isOpening={fileUrlMutation.isPending}
                onOpen={() => void openReference()}
                reference={reference}
                ownerContext={referenceOwnerContext}
              />
            ) : null}
          </ApiStateBoundary>
        </section>
      </div>
    </main>
  );
}

function ReferenceDetailCard({
  dashboardRole,
  isOpening,
  onOpen,
  ownerContext,
  reference,
}: {
  dashboardRole: ReferenceDashboardRole;
  isOpening: boolean;
  onOpen: () => void;
  ownerContext: ReferenceOwnerContext;
  reference: ReferenceItem;
}) {
  const Icon = reference.displayType === "link" ? Link2 : FileText;

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--rail-border)] bg-white shadow-[var(--shadow-soft)]">
      <header className="border-b border-[var(--rail-border)] p-4 sm:p-5">
        <Link
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--signal-blue)]"
          href={`/${dashboardRole}/references`}
        >
          <ArrowLeft aria-hidden="true" size={14} />
          Kembali ke referensi
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-2.5 py-1 text-[10px] font-semibold text-[var(--rail-ink)]">
              <Icon aria-hidden="true" size={12} />
              {reference.displayType === "file"
                ? "File"
                : reference.displayType === "link"
                  ? "Tautan"
                  : "Teks"}
            </span>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--rail-ink)]">
              {reference.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Dibuat oleh {getReferenceOwner(reference, ownerContext)}
            </p>
          </div>
          {reference.displayType !== "text" ? (
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
              disabled={isOpening}
              onClick={onOpen}
              type="button"
            >
              <ExternalLink aria-hidden="true" size={14} />
              {isOpening ? "Membuka..." : "Lihat"}
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_260px]">
        <article className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-4">
          <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
            Deskripsi
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-muted)]">
            {reference.description || "Tidak ada deskripsi."}
          </p>
        </article>
        <aside className="space-y-3">
          <InfoTile label="Kategori" value={reference.category ?? "-"} />
          <InfoTile label="Versi" value={reference.version} />
          <InfoTile
            label="File"
            value={reference.fileName ?? reference.mimeType ?? "-"}
          />
          <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              Tag
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reference.tags.length > 0 ? (
                reference.tags.map((tag) => (
                  <span
                    className="rounded-full border border-[var(--rail-border)] bg-white px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--text-muted)]">-</span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ReferenceUnavailable({
  dashboardRole,
}: {
  dashboardRole: ReferenceDashboardRole;
}) {
  return (
    <section className="rounded-xl border border-dashed border-[var(--rail-border)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
      <Archive
        aria-hidden="true"
        className="mx-auto text-[var(--text-tertiary)]"
        size={26}
      />
      <h1 className="mt-3 text-lg font-semibold text-[var(--rail-ink)]">
        Referensi tidak tersedia.
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        Referensi ini mungkin sudah diarsipkan, masih berupa draf, atau Anda
        tidak memiliki akses untuk membukanya.
      </p>
      <Link
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white"
        href={`/${dashboardRole}/references`}
      >
        <RefreshCcw aria-hidden="true" size={14} />
        Kembali
      </Link>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function buildUserLookup(
  users: UserLookupItem[],
  currentUser?: AuthUser | null,
) {
  const usersById: ReferenceOwnerContext["usersById"] = {};

  for (const user of users) {
    usersById[user.id] = user;
  }

  if (currentUser) {
    usersById[currentUser.id] = currentUser;
  }

  return usersById;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.status === 404 ? "Referensi tidak tersedia." : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Gagal memuat referensi. Silakan coba lagi.";
}
