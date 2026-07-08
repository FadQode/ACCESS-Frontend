"use client";

import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  FileText,
  Link2,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
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
import { useArchiveReference } from "../hooks/use-archive-reference";
import { useCreateReference } from "../hooks/use-create-reference";
import { useReferenceDetails } from "../hooks/use-reference-details";
import { useReferenceFileUrl } from "../hooks/use-reference-file-url";
import { useReferenceTags } from "../hooks/use-reference-tags";
import { useReferences } from "../hooks/use-references";
import { useUpdateReference } from "../hooks/use-update-reference";
import {
  getReferenceOwner,
  type ReferenceOwnerContext,
} from "../model/mappers/reference.mapper";
import {
  getCachedReferenceOwners,
  type ReferenceOwnerCache,
  rememberReferenceOwner,
} from "../model/reference-owner-cache";
import {
  MAX_REFERENCE_FILE_SIZE_BYTES,
  referenceFormSchema,
} from "../model/schemas/reference.schema";
import type {
  GetReferencesParams,
  ReferenceCategory,
  ReferenceItem,
  ReferenceSourceType,
} from "../model/types/reference.types";
import {
  closeReferenceWindow,
  navigateReferenceWindow,
  openPendingReferenceWindow,
} from "./open-reference-window";

type ReferenceDashboardRole = "agent" | "manager";
type ModalState =
  | { type: "create" }
  | { type: "edit"; reference: ReferenceItem }
  | { type: "archive"; reference: ReferenceItem }
  | null;
type SortDirection = "asc" | "desc";
type ReferenceSortKey = "createdAt" | "tags" | "title" | "type" | "uploadedBy";
type ReferenceSortConfig = {
  key: ReferenceSortKey;
  direction: SortDirection;
};
type ReferenceFormMode = "file" | "link" | "text";
type ReferenceModalStyle = CSSProperties & {
  "--reference-modal-max-height": string;
  "--reference-modal-top": string;
};

const CATEGORY_OPTIONS: Array<{ label: string; value: ReferenceCategory }> = [
  { label: "Tiket / Booking", value: "ticket_booking" },
  { label: "Aplikasi Error / Lemot", value: "app_error" },
  { label: "Login / OTP / Akun", value: "account" },
  { label: "Pembayaran", value: "payment" },
  { label: "Update Aplikasi", value: "app_update" },
  { label: "CS Tidak Merespons", value: "no_response_cs" },
  { label: "Refund / Pembatalan", value: "refund_cancel" },
  { label: "Antrian / Promo", value: "queue_problem" },
  { label: "Barang Tertinggal", value: "lost_item" },
  { label: "Fasilitas", value: "facility" },
  { label: "Lainnya", value: "other" },
];

const TYPE_OPTIONS: Array<{
  label: string;
  value: Extract<
    ReferenceSourceType,
    "external_link" | "internal_note" | "uploaded_file"
  >;
}> = [
  { label: "File", value: "uploaded_file" },
  { label: "Tautan", value: "external_link" },
  { label: "Teks", value: "internal_note" },
];
const ACCEPTED_REFERENCE_FILE_TYPES = [
  ".pdf",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".doc",
  ".docx",
].join(",");
const ACCEPTED_REFERENCE_FILE_LABEL = "PDF, TXT, PNG, JPG/JPEG, DOC, atau DOCX";
const MAX_REFERENCE_FILE_SIZE_LABEL = "5 MB";

export function ReferenceManagementPage({
  dashboardRole,
}: {
  dashboardRole: ReferenceDashboardRole;
}) {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const router = useRouter();
  const sessionUser = useSessionUser();
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data ?? sessionUser;
  const canManage =
    currentUser?.role === "manager" || currentUser?.role === "admin";
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [sourceType, setSourceType] = useState<ReferenceSourceType | "">("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [feedback, setFeedback] = useState("");
  const [cachedOwners, setCachedOwners] = useState<ReferenceOwnerCache>({});
  const [sortConfig, setSortConfig] = useState<ReferenceSortConfig>({
    direction: "asc",
    key: "title",
  });
  const filters = useMemo<GetReferencesParams>(
    () => ({
      limit: 10,
      page,
      query,
      sourceType,
      status: "active",
      tag,
    }),
    [page, query, sourceType, tag],
  );
  const referencesQuery = useReferences(filters);
  const tagsQuery = useReferenceTags();
  const usersQuery = useUsers(Boolean(currentUser));
  const fileUrlMutation = useReferenceFileUrl();
  const archiveMutation = useArchiveReference();
  const references = useMemo(
    () => sortReferences(referencesQuery.data?.items ?? [], sortConfig),
    [referencesQuery.data?.items, sortConfig],
  );
  const referenceDetailQueries = useReferenceDetails(
    references.map((reference) => reference.id),
    references.length > 0,
  );
  const usersById = useMemo(
    () => buildUserLookup(usersQuery.data ?? [], currentUser),
    [currentUser, usersQuery.data],
  );
  const detailOwners = useMemo(
    () =>
      buildReferenceDetailOwnerLookup(
        referenceDetailQueries
          .map((queryResult) => queryResult.data)
          .filter((reference): reference is ReferenceItem =>
            Boolean(reference),
          ),
        {
          currentUser,
          usersById,
        },
      ),
    [currentUser, referenceDetailQueries, usersById],
  );
  const referenceOwnerContext = useMemo(
    () => ({
      currentUser,
      ownersByReferenceId: {
        ...cachedOwners,
        ...detailOwners,
      },
      usersById,
    }),
    [cachedOwners, currentUser, detailOwners, usersById],
  );
  const pagination = referencesQuery.data?.pagination;

  const changeSort = (key: ReferenceSortKey) => {
    setSortConfig((current) => ({
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
      key,
    }));
  };

  useEffect(() => {
    setCachedOwners(getCachedReferenceOwners());
  }, []);

  const openReference = async (reference: ReferenceItem) => {
    setFeedback("");

    if (reference.displayType === "link") {
      if (!reference.url) {
        setFeedback("Link referensi tidak tersedia.");
        return;
      }

      window.open(reference.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (reference.displayType === "file") {
      const pendingWindow = openPendingReferenceWindow();

      try {
        const fileUrl = await fileUrlMutation.mutateAsync(reference.id);
        if (!navigateReferenceWindow(pendingWindow, fileUrl.signedUrl)) {
          setFeedback(
            "Browser memblokir tab referensi. Izinkan pop-up lalu coba lagi.",
          );
        }
      } catch {
        closeReferenceWindow(pendingWindow);
        setFeedback("Gagal membuka file referensi. Silakan coba lagi.");
      }
      return;
    }

    router.push(`/${dashboardRole}/references/${reference.id}`);
  };

  const confirmArchive = async () => {
    if (modal?.type !== "archive") {
      return;
    }

    try {
      await archiveMutation.mutateAsync(modal.reference.id);
      setFeedback("Referensi berhasil diarsipkan.");
      setModal(null);
    } catch {
      setFeedback("Gagal mengarsipkan referensi. Silakan coba lagi.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole={dashboardRole}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Dimuat", value: references.length.toString() },
            { label: "Total", value: String(pagination?.total ?? 0) },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole={dashboardRole}
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel={
              dashboardRole === "manager"
                ? "Referensi manager"
                : "Referensi agent"
            }
            userName={currentUser?.name ?? "User"}
          />

          <section className="overflow-hidden rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
            <header className="border-b border-[var(--rail-border)] bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                    Pustaka referensi
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                    Referensi
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    Materi internal aktif untuk panduan operasional.
                  </p>
                </div>
                {canManage ? (
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)]"
                    onClick={() => setModal({ type: "create" })}
                    type="button"
                  >
                    <Plus aria-hidden="true" size={15} />
                    Tambah Referensi
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                <label className="relative">
                  <span className="sr-only">Cari referensi</span>
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                    size={16}
                  />
                  <input
                    className="h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                    onChange={(event) => {
                      setPage(1);
                      setQuery(event.target.value);
                    }}
                    placeholder="Cari judul atau isi referensi"
                    type="search"
                    value={query}
                  />
                </label>
                <select
                  className="h-11 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                  onChange={(event) => {
                    setPage(1);
                    setTag(event.target.value);
                  }}
                  value={tag}
                >
                  <option value="">Semua tag</option>
                  {(tagsQuery.data ?? []).map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-11 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                  onChange={(event) => {
                    setPage(1);
                    setSourceType(
                      event.target.value as ReferenceSourceType | "",
                    );
                  }}
                  value={sourceType}
                >
                  <option value="">Semua tipe</option>
                  {TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </header>

            <div className="p-4 sm:p-5">
              {feedback ? (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-3 py-2 text-sm text-[var(--signal-blue)]">
                  <span>{feedback}</span>
                  <button
                    aria-label="Tutup feedback"
                    onClick={() => setFeedback("")}
                    type="button"
                  >
                    <X aria-hidden="true" size={14} />
                  </button>
                </div>
              ) : null}

              <ApiStateBoundary
                emptyFallback={<ReferenceEmptyState canManage={canManage} />}
                errorMessage={getErrorMessage(referencesQuery.error)}
                isEmpty={references.length === 0}
                isError={referencesQuery.isError}
                isLoading={referencesQuery.isLoading}
                loadingFallback={<ReferenceTableSkeleton />}
                onRetry={() => {
                  void referencesQuery.refetch();
                }}
              >
                <ReferenceTable
                  canManage={canManage}
                  isOpeningFile={fileUrlMutation.isPending}
                  onArchive={(reference) =>
                    setModal({ reference, type: "archive" })
                  }
                  onEdit={(reference) => setModal({ reference, type: "edit" })}
                  onOpen={(reference) => void openReference(reference)}
                  ownerContext={referenceOwnerContext}
                  references={references}
                  sortConfig={sortConfig}
                  onSortChange={changeSort}
                />

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--rail-border)] pt-4">
                  <button
                    className="h-10 rounded-lg border border-[var(--rail-border)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    type="button"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs text-[var(--text-muted)]">
                    Halaman {pagination?.page ?? page} dari{" "}
                    {pagination?.totalPages ?? 1}
                  </span>
                  <button
                    className="h-10 rounded-lg border border-[var(--rail-border)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!pagination || page >= pagination.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    type="button"
                  >
                    Berikutnya
                  </button>
                </div>
              </ApiStateBoundary>
            </div>
          </section>
        </section>
      </div>

      {modal?.type === "create" || modal?.type === "edit" ? (
        <ReferenceFormModal
          currentUser={currentUser}
          mode={modal.type}
          onClose={() => setModal(null)}
          onCreated={(reference) => {
            setCachedOwners(rememberReferenceOwner(reference.id, currentUser));
          }}
          onSuccess={(message) => {
            setFeedback(message);
            setModal(null);
          }}
          reference={modal.type === "edit" ? modal.reference : undefined}
        />
      ) : null}

      {modal?.type === "archive" ? (
        <ArchiveReferenceDialog
          isPending={archiveMutation.isPending}
          onClose={() => setModal(null)}
          onConfirm={() => void confirmArchive()}
          reference={modal.reference}
        />
      ) : null}
    </main>
  );
}

function ReferenceTable({
  canManage,
  isOpeningFile,
  onArchive,
  onEdit,
  onOpen,
  ownerContext,
  onSortChange,
  references,
  sortConfig,
}: {
  canManage: boolean;
  isOpeningFile: boolean;
  onArchive: (reference: ReferenceItem) => void;
  onEdit: (reference: ReferenceItem) => void;
  onOpen: (reference: ReferenceItem) => void;
  ownerContext: ReferenceOwnerContext;
  onSortChange: (key: ReferenceSortKey) => void;
  references: ReferenceItem[];
  sortConfig: ReferenceSortConfig;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);

    window.addEventListener("pointerdown", closeMenu);

    return () => window.removeEventListener("pointerdown", closeMenu);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            <th className="border-b border-[var(--rail-border)] px-3 py-3 font-semibold">
              <SortButton
                label="Judul"
                sortConfig={sortConfig}
                sortKey="title"
                onSortChange={onSortChange}
              />
            </th>
            <th className="border-b border-[var(--rail-border)] px-3 py-3 font-semibold">
              <SortButton
                label="Tipe"
                sortConfig={sortConfig}
                sortKey="type"
                onSortChange={onSortChange}
              />
            </th>
            <th className="border-b border-[var(--rail-border)] px-3 py-3 font-semibold">
              <SortButton
                label="Tag"
                sortConfig={sortConfig}
                sortKey="tags"
                onSortChange={onSortChange}
              />
            </th>
            <th className="border-b border-[var(--rail-border)] px-3 py-3 font-semibold">
              <SortButton
                label="Dibuat Oleh"
                sortConfig={sortConfig}
                sortKey="uploadedBy"
                onSortChange={onSortChange}
              />
            </th>
            <th className="border-b border-[var(--rail-border)] px-3 py-3 font-semibold">
              <SortButton
                label="Ditambahkan"
                sortConfig={sortConfig}
                sortKey="createdAt"
                onSortChange={onSortChange}
              />
            </th>
            <th className="w-24 border-b border-[var(--rail-border)] px-3 py-3 text-right font-semibold">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {references.map((reference) => (
            <tr className="align-top" key={reference.id}>
              <td className="border-b border-[var(--rail-border)] px-3 py-4">
                <p className="max-w-[360px] truncate text-sm font-semibold text-[var(--rail-ink)]">
                  {reference.title}
                </p>
                {reference.description ? (
                  <p className="mt-1 max-w-[420px] line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
                    {reference.description}
                  </p>
                ) : null}
              </td>
              <td className="border-b border-[var(--rail-border)] px-3 py-4">
                <ReferenceTypeBadge reference={reference} />
              </td>
              <td className="border-b border-[var(--rail-border)] px-3 py-4">
                <div className="flex max-w-[320px] flex-wrap gap-1.5">
                  {reference.tags.length > 0 ? (
                    reference.tags.map((item) => (
                      <span
                        className="rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]"
                        key={item}
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      -
                    </span>
                  )}
                </div>
              </td>
              <td className="border-b border-[var(--rail-border)] px-3 py-4 text-xs font-semibold text-[var(--text-muted)]">
                {getReferenceOwner(reference, ownerContext)}
              </td>
              <td className="whitespace-nowrap border-b border-[var(--rail-border)] px-3 py-4 text-xs font-semibold text-[var(--text-muted)]">
                {formatReferenceDate(reference.createdAt)}
              </td>
              <td className="border-b border-[var(--rail-border)] px-3 py-4 text-right">
                <div
                  className="relative inline-block text-left"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button
                    aria-expanded={openMenuId === reference.id}
                    aria-label="Buka aksi"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === reference.id ? null : reference.id,
                      )
                    }
                    type="button"
                  >
                    <MoreHorizontal aria-hidden="true" size={16} />
                  </button>
                  {openMenuId === reference.id ? (
                    <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-[var(--rail-border)] bg-white p-1 shadow-[var(--shadow-soft)]">
                      <ActionButton
                        disabled={isOpeningFile}
                        icon={<ExternalLink aria-hidden="true" size={14} />}
                        label="Lihat"
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpen(reference);
                        }}
                      />
                      {canManage ? (
                        <>
                          <ActionButton
                            icon={<Pencil aria-hidden="true" size={14} />}
                            label="Edit"
                            onClick={() => {
                              setOpenMenuId(null);
                              onEdit(reference);
                            }}
                          />
                          <ActionButton
                            danger
                            icon={<Archive aria-hidden="true" size={14} />}
                            label="Arsipkan"
                            onClick={() => {
                              setOpenMenuId(null);
                              onArchive(reference);
                            }}
                          />
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortButton({
  label,
  onSortChange,
  sortConfig,
  sortKey,
}: {
  label: string;
  onSortChange: (key: ReferenceSortKey) => void;
  sortConfig: ReferenceSortConfig;
  sortKey: ReferenceSortKey;
}) {
  const isActive = sortConfig.key === sortKey;
  const Icon = !isActive
    ? ArrowUpDown
    : sortConfig.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <button
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
        isActive
          ? "text-[var(--signal-blue)]"
          : "text-[var(--text-tertiary)] hover:text-[var(--rail-ink)]"
      }`}
      onClick={() => onSortChange(sortKey)}
      type="button"
    >
      {label}
      <Icon aria-hidden="true" size={12} />
    </button>
  );
}

function ReferenceTypeBadge({ reference }: { reference: ReferenceItem }) {
  const isFile = reference.displayType === "file";
  const isLink = reference.displayType === "link";
  const Icon = isFile ? FileText : isLink ? Link2 : FileText;
  const label = isFile ? "File" : isLink ? "Tautan" : "Teks";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-2.5 py-1 text-[10px] font-semibold text-[var(--rail-ink)]">
      <Icon aria-hidden="true" size={12} />
      {label}
    </span>
  );
}

function getFormModeLabel(mode: ReferenceFormMode) {
  if (mode === "file") {
    return "File";
  }

  if (mode === "text") {
    return "Teks";
  }

  return "Tautan";
}

function ActionButton({
  danger = false,
  disabled = false,
  icon,
  label,
  onClick,
}: {
  danger?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-[var(--signal-red-dark)] hover:bg-[var(--signal-red-soft)]"
          : "text-[var(--text-muted)] hover:bg-[var(--background)] hover:text-[var(--rail-ink)]"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function ReferenceFormModal({
  currentUser,
  mode,
  onClose,
  onCreated,
  onSuccess,
  reference,
}: {
  currentUser?: AuthUser | null;
  mode: "create" | "edit";
  onClose: () => void;
  onCreated?: (reference: ReferenceItem) => void;
  onSuccess: (message: string) => void;
  reference?: ReferenceItem;
}) {
  const createMutation = useCreateReference();
  const updateMutation = useUpdateReference();
  const fileInputId = useId();
  const [formMode, setFormMode] = useState<ReferenceFormMode>(
    reference?.displayType === "file"
      ? "file"
      : reference?.displayType === "text"
        ? "text"
        : "link",
  );
  const [title, setTitle] = useState(reference?.title ?? "");
  const [description, setDescription] = useState(reference?.description ?? "");
  const [url, setUrl] = useState(reference?.url ?? "");
  const [category, setCategory] = useState<ReferenceCategory | "">(
    reference?.category ?? "",
  );
  const [tagsInput, setTagsInput] = useState(reference?.tags.join(", ") ?? "");
  const [file, setFile] = useState<File | undefined>();
  const [error, setError] = useState("");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isEditing = mode === "edit";
  const canEditUrl = !reference || reference.displayType === "link";

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      if (isEditing && reference) {
        if (title.trim().length === 0) {
          setError("Judul wajib diisi.");
          return;
        }

        if (
          reference.displayType === "text" &&
          description.trim().length === 0
        ) {
          setError("Isi teks referensi wajib diisi.");
          return;
        }

        const tags = parseTags(tagsInput);

        await updateMutation.mutateAsync({
          id: reference.id,
          input: {
            category: category || null,
            description,
            tags,
            title,
            url: canEditUrl ? url : reference.url,
          },
        });
        onSuccess("Referensi berhasil diperbarui.");
        return;
      }

      const tags = parseTags(tagsInput);
      const creator = {
        createdByEmail: currentUser?.email ?? null,
        createdByName: currentUser?.name ?? null,
      };
      const parsed = referenceFormSchema.safeParse({
        category,
        description,
        file,
        mode: formMode,
        tags,
        title,
        url,
      });

      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ?? "Data referensi belum valid.",
        );
        return;
      }

      let createdReference: ReferenceItem;

      if (formMode === "file" && file) {
        createdReference = await createMutation.mutateAsync({
          category: category || null,
          ...creator,
          description,
          file,
          mode: "file",
          tags,
          title,
        });
      } else if (formMode === "text") {
        createdReference = await createMutation.mutateAsync({
          category: category || null,
          ...creator,
          description,
          mode: "text",
          tags,
          title,
        });
      } else {
        createdReference = await createMutation.mutateAsync({
          category: category || null,
          ...creator,
          description,
          mode: "link",
          tags,
          title,
          url,
        });
      }

      onCreated?.(createdReference);
      onSuccess("Referensi berhasil ditambahkan.");
    } catch {
      setError(
        isEditing
          ? "Gagal memperbarui referensi. Silakan coba lagi."
          : "Gagal menambahkan referensi. Silakan coba lagi.",
      );
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      title={isEditing ? "Edit Referensi" : "Tambah Referensi"}
    >
      <form className="space-y-4" onSubmit={(event) => void submitForm(event)}>
        {!isEditing ? (
          <div>
            <RequiredFieldLabel label="Tipe" />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["link", "file", "text"] as const).map((item) => (
                <button
                  className={`h-10 rounded-lg border text-xs font-semibold transition ${
                    formMode === item
                      ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
                      : "border-[var(--rail-border)] text-[var(--text-muted)] hover:border-[var(--signal-blue)]"
                  }`}
                  key={item}
                  onClick={() => setFormMode(item)}
                  type="button"
                >
                  {getFormModeLabel(item)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <FormField label="Judul" required>
          <input
            className={fieldClassName}
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </FormField>

        <FormField
          label={formMode === "text" ? "Isi teks referensi" : "Deskripsi"}
          required={formMode === "text"}
        >
          <textarea
            className={`${fieldClassName} min-h-24 resize-none py-3`}
            placeholder={
              formMode === "text"
                ? "Tulis referensi teks yang akan dibaca tim."
                : undefined
            }
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </FormField>

        {formMode === "file" && !isEditing ? (
          <FileUploadField
            file={file}
            inputId={fileInputId}
            onFileChange={setFile}
            required
          />
        ) : null}

        {formMode === "link" && canEditUrl ? (
          <FormField label="URL" required={!isEditing}>
            <input
              className={fieldClassName}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              value={url}
            />
          </FormField>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Kategori">
            <select
              className={fieldClassName}
              onChange={(event) =>
                setCategory(event.target.value as ReferenceCategory | "")
              }
              value={category}
            >
              <option value="">Tanpa kategori</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Tag">
            <input
              className={fieldClassName}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="saldo_terpotong, refund"
              value={tagsInput}
            />
          </FormField>
        </div>

        {error ? (
          <p className="rounded-lg border border-[var(--signal-red)] bg-[var(--signal-red-soft)] px-3 py-2 text-xs text-[var(--signal-red-dark)]">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-[var(--rail-border)] pt-4">
          <button
            className="h-10 rounded-lg border border-[var(--rail-border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:bg-[var(--rail-border)] disabled:text-[var(--text-muted)]"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={14}
                />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ArchiveReferenceDialog({
  isPending,
  onClose,
  onConfirm,
  reference,
}: {
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reference: ReferenceItem;
}) {
  return (
    <ModalShell onClose={onClose} title="Arsipkan referensi?">
      <p className="text-sm leading-6 text-[var(--text-muted)]">
        Referensi "{reference.title}" tidak akan muncul lagi di daftar aktif,
        tetapi data dapat tetap tersimpan di sistem.
      </p>
      <div className="mt-5 flex justify-end gap-2 border-t border-[var(--rail-border)] pt-4">
        <button
          className="h-10 rounded-lg border border-[var(--rail-border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
          onClick={onClose}
          type="button"
        >
          Batal
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--signal-red)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-red-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          onClick={onConfirm}
          type="button"
        >
          {isPending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin"
                size={14}
              />
              Mengarsipkan...
            </>
          ) : (
            "Arsipkan"
          )}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  const [modalStyle, setModalStyle] = useState<ReferenceModalStyle>({
    "--reference-modal-max-height": "calc(100dvh - 32px)",
    "--reference-modal-top": "16px",
  });

  useEffect(() => {
    const updateModalViewport = () => {
      const viewport = window.visualViewport;
      const visibleHeight = viewport?.height ?? window.innerHeight;

      setModalStyle({
        "--reference-modal-max-height": `${Math.max(
          120,
          visibleHeight - 32,
        )}px`,
        "--reference-modal-top": `${(visibleHeight - Math.min(visibleHeight - 32, 600)) / 2}px`,
      });
    };

    updateModalViewport();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", updateModalViewport);
    viewport?.addEventListener("scroll", updateModalViewport);
    window.addEventListener("resize", updateModalViewport);

    return () => {
      viewport?.removeEventListener("resize", updateModalViewport);
      viewport?.removeEventListener("scroll", updateModalViewport);
      window.removeEventListener("resize", updateModalViewport);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[rgba(19,35,31,0.42)] p-4 backdrop-blur-[2px]"
      style={modalStyle}
    >
      <section className="fixed left-1/2 top-[var(--reference-modal-top)] flex max-h-[var(--reference-modal-max-height)] w-[calc(100vw-32px)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-[var(--rail-border)] bg-white shadow-[var(--shadow-soft)]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--rail-border)] bg-white px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
            {title}
          </h2>
          <button
            aria-label="Tutup modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={14} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </section>
    </div>
  );
}

function FileUploadField({
  file,
  inputId,
  onFileChange,
  required = false,
}: {
  file?: File;
  inputId: string;
  onFileChange: (file?: File) => void;
  required?: boolean;
}) {
  const isTooLarge = Boolean(file && file.size > MAX_REFERENCE_FILE_SIZE_BYTES);

  return (
    <div>
      <RequiredFieldLabel label="File" required={required} />
      <label
        className={`mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition ${
          isTooLarge
            ? "border-[var(--signal-red)] bg-[var(--signal-red-soft)]"
            : file
              ? "border-[var(--signal-green)] bg-[var(--signal-green-soft)]"
              : "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] hover:bg-white"
        }`}
        htmlFor={inputId}
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            isTooLarge
              ? "bg-[var(--signal-red)] text-white"
              : file
                ? "bg-[var(--signal-green)] text-white"
                : "bg-white text-[var(--signal-blue)]"
          }`}
        >
          <UploadCloud aria-hidden="true" size={20} />
        </span>
        <span className="mt-3 text-sm font-semibold text-[var(--rail-ink)]">
          {file ? file.name : "Pilih file referensi"}
        </span>
        <span className="mt-1 max-w-md text-xs leading-5 text-[var(--text-muted)]">
          {isTooLarge
            ? `${formatFileSize(file?.size ?? 0)} melebihi batas maksimal ${MAX_REFERENCE_FILE_SIZE_LABEL}.`
            : file
              ? `${formatFileSize(file.size)} - klik untuk mengganti file`
              : `File yang diterima: ${ACCEPTED_REFERENCE_FILE_LABEL}. Maksimal ${MAX_REFERENCE_FILE_SIZE_LABEL}.`}
        </span>
        <span className="mt-3 rounded-full border border-[var(--rail-border)] bg-white px-3 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
          Pilih file
        </span>
      </label>
      <input
        accept={ACCEPTED_REFERENCE_FILE_TYPES}
        className="sr-only"
        id={inputId}
        onChange={(event) => onFileChange(event.target.files?.[0])}
        type="file"
      />
      <p className="mt-2 text-[11px] leading-5 text-[var(--text-tertiary)]">
        Hindari file executable atau arsip terkompresi. Gunakan dokumen atau
        gambar yang aman dibuka tim operasional.
      </p>
    </div>
  );
}

const fieldClassName =
  "h-11 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]";

function FormField({
  children,
  label,
  required = false,
}: {
  children: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <RequiredFieldLabel label={label} required={required} />
      <span className="mt-2 block">{children}</span>
    </div>
  );
}

function RequiredFieldLabel({
  label,
  required = true,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <span className="text-xs font-semibold text-[var(--rail-ink)]">
      {label}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-[var(--signal-red)]">
          *
        </span>
      ) : null}
    </span>
  );
}

function ReferenceEmptyState({ canManage }: { canManage: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-6 text-center">
      <p className="text-sm font-semibold text-[var(--rail-ink)]">
        {canManage ? "Belum ada referensi." : "Belum ada referensi aktif."}
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        {canManage
          ? "Tambahkan referensi pertama untuk membantu proses penanganan keluhan."
          : "Referensi akan muncul di sini setelah tersedia."}
      </p>
    </div>
  );
}

function ReferenceTableSkeleton() {
  const rows = [
    "reference-skeleton-a",
    "reference-skeleton-b",
    "reference-skeleton-c",
    "reference-skeleton-d",
    "reference-skeleton-e",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--rail-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin text-[var(--signal-blue)]"
          size={16}
        />
        Memuat referensi...
      </div>
      {rows.map((row) => (
        <div
          className="h-16 animate-pulse rounded-lg bg-[var(--background)]"
          key={row}
        />
      ))}
    </div>
  );
}

function sortReferences(
  references: ReferenceItem[],
  sortConfig: ReferenceSortConfig,
) {
  const direction = sortConfig.direction === "asc" ? 1 : -1;

  return [...references].sort((first, second) => {
    const result = compareReferenceSortValues(
      getReferenceSortValue(first, sortConfig.key),
      getReferenceSortValue(second, sortConfig.key),
    );

    return result * direction;
  });
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

function buildReferenceDetailOwnerLookup(
  references: ReferenceItem[],
  context: ReferenceOwnerContext,
) {
  const ownersByReferenceId: ReferenceOwnerContext["ownersByReferenceId"] = {};

  for (const reference of references) {
    const ownerName = getReferenceOwner(reference, context);

    if (ownerName === "Internal") {
      continue;
    }

    ownersByReferenceId[reference.id] = {
      email: reference.uploadedBy?.email ?? null,
      id: reference.uploadedBy?.id ?? reference.createdBy ?? null,
      name: ownerName,
    };
  }

  return ownersByReferenceId;
}

function getReferenceSortValue(
  reference: ReferenceItem,
  key: ReferenceSortKey,
): number | string {
  if (key === "createdAt") {
    return toTime(reference.createdAt);
  }

  if (key === "type") {
    return reference.displayType;
  }

  if (key === "tags") {
    return reference.tags.join(" ");
  }

  if (key === "uploadedBy") {
    return getReferenceOwner(reference);
  }

  return reference.title;
}

function compareReferenceSortValues(
  first: number | string,
  second: number | string,
) {
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }

  return String(first).localeCompare(String(second), "id", {
    numeric: true,
    sensitivity: "base",
  });
}

function formatReferenceDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toTime(value?: string | null) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Gagal memuat referensi. Silakan coba lagi.";
}
