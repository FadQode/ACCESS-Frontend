"use client";

import { AlertTriangle, Eye, EyeOff, Info, RefreshCcw, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { FeedbackDialog } from "@/core/components/feedback/feedback-dialog";
import { LoadingOverlay } from "@/core/components/feedback/loading-overlay";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useReferenceFileUrl } from "@/core/reference/hooks/use-reference-file-url";
import { useTicketWorkspace } from "../hooks/useTicketWorkspace";
import type { AttachedReferenceForTicket } from "../model/ticket.types";
import { TicketAssistPanel } from "./TicketAssistPanel";
import { TicketDetail } from "./TicketDetail";
import { TicketQueue } from "./TicketQueue";

export function TicketWorkspace() {
  const workspace = useTicketWorkspace();
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const fileUrlMutation = useReferenceFileUrl();
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [assistPanelOpen, setAssistPanelOpen] = useState(false);
  const [referencePreview, setReferencePreview] =
    useState<AttachedReferenceForTicket | null>(null);
  const [referenceFeedback, setReferenceFeedback] = useState({
    description: "",
    open: false,
    title: "",
  });

  const activeTicketCount = workspace.readyCount + workspace.waitingCount;
  const isAdminFinalClosure = sessionUser?.role === "admin";
  const canPerformFinalClosure = sessionUser?.role !== "manager";

  const openManagerReference = async (
    reference: AttachedReferenceForTicket,
  ) => {
    if (reference.displayType === "link") {
      if (reference.url) {
        window.open(reference.url, "_blank", "noopener,noreferrer");
        return;
      }

      setReferenceFeedback({
        description: "Link referensi tidak tersedia.",
        open: true,
        title: "Referensi tidak bisa dibuka",
      });
      return;
    }

    if (reference.displayType === "file") {
      try {
        const fileUrl = await fileUrlMutation.mutateAsync(
          reference.referenceSourceId,
        );
        window.open(fileUrl.signedUrl, "_blank", "noopener,noreferrer");
      } catch {
        setReferenceFeedback({
          description: "Gagal membuka file referensi. Silakan coba lagi.",
          open: true,
          title: "Referensi tidak bisa dibuka",
        });
      }
      return;
    }

    setReferencePreview(reference);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <LoadingOverlay
        description="Merekam balasan akhir, menyelesaikan complaint, dan menutup ticket."
        open={workspace.isFinalClosurePending}
        title="Menandai ticket selesai..."
      />
      <FeedbackDialog
        description={workspace.finalClosureFeedback.description}
        onOpenChange={(open) => {
          if (!open) {
            workspace.dismissFinalClosureFeedback();
          }
        }}
        open={workspace.finalClosureFeedback.open}
        title={workspace.finalClosureFeedback.title}
        variant={workspace.finalClosureFeedback.variant}
      />
      <FeedbackDialog
        description={referenceFeedback.description}
        onOpenChange={(open) => {
          if (!open) {
            setReferenceFeedback((current) => ({ ...current, open: false }));
          }
        }}
        open={referenceFeedback.open}
        title={referenceFeedback.title}
        variant="error"
      />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[{ label: "Aktif", value: activeTicketCount.toString() }]}
        />

        <section className="relative flex min-h-[700px] min-w-0 flex-1 flex-col rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5 xl:h-[calc(100vh-40px)]">
          {navbarVisible ? (
            <DashboardNavbar
              controls={
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
                      assistPanelOpen
                        ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
                        : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                    }`}
                    onClick={() => setAssistPanelOpen((open) => !open)}
                    type="button"
                  >
                    <Info aria-hidden="true" size={15} />
                    Konteks
                  </button>
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                    onClick={() => setNavbarVisible(false)}
                    type="button"
                  >
                    <EyeOff aria-hidden="true" size={15} />
                    Sembunyikan navbar
                  </button>
                </div>
              }
              dashboardRole="agent"
              isSidebarOpen={sidebarOpen}
              onSidebarToggle={toggleSidebar}
              roleLabel="Agen dukungan"
              userName="Rizky A."
            />
          ) : (
            <button
              className="absolute right-5 top-5 z-20 inline-flex h-9 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow-soft)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              onClick={() => setNavbarVisible(true)}
              type="button"
            >
              <Eye aria-hidden="true" size={14} />
              Tampilkan navbar
            </button>
          )}

          {workspace.isLoading && !workspace.selectedTicket ? (
            <TicketWorkspaceState
              title="Memuat tickets..."
              description="Mengambil ticket tindak lanjut dari backend."
            />
          ) : workspace.errorMessage ? (
            <TicketWorkspaceState
              action={
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)]"
                  onClick={() => workspace.refetchTickets()}
                  type="button"
                >
                  <RefreshCcw aria-hidden="true" size={14} />
                  Coba lagi
                </button>
              }
              description={workspace.errorMessage}
              icon={<AlertTriangle aria-hidden="true" size={18} />}
              title="Tickets gagal dimuat"
            />
          ) : !workspace.selectedTicket ? (
            <TicketWorkspaceState
              title="Belum ada follow-up ticket"
              description="Ticket akan muncul setelah agent mengirim HEA dan meminta aksi."
            />
          ) : (
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-muted)] shadow-[var(--shadow-soft)] xl:flex-row">
              <TicketQueue
                filter={workspace.filter}
                onFilterChange={workspace.setFilter}
                onSearchChange={workspace.setSearchQuery}
                onSelectTicket={workspace.setSelectedTicketId}
                onSortChange={workspace.setSortKey}
                searchQuery={workspace.searchQuery}
                selectedTicketId={workspace.selectedTicketId}
                sortConfig={workspace.sortConfig}
                tickets={workspace.tickets}
              />
              <TicketDetail
                closureDraft={workspace.closureDraft}
                canPerformFinalClosure={canPerformFinalClosure}
                closureContextWarning={workspace.closureContextWarning}
                hasCopiedClosure={workspace.hasCopiedClosure}
                isAdminFinalClosure={isAdminFinalClosure}
                isFinalClosurePending={workspace.isFinalClosurePending}
                onClosureDraftChange={workspace.setClosureDraft}
                onCopyClosureAndClose={workspace.copyClosureAndClose}
                onOpenManagerReference={(reference) => {
                  void openManagerReference(reference);
                }}
                ticket={workspace.selectedTicket}
              />
              {assistPanelOpen ? (
                <TicketAssistPanel
                  onClose={() => setAssistPanelOpen(false)}
                  ticket={workspace.selectedTicket}
                />
              ) : null}
            </section>
          )}
        </section>
      </div>
      {referencePreview ? (
        <ReferencePreviewModal
          onClose={() => setReferencePreview(null)}
          reference={referencePreview}
        />
      ) : null}
    </main>
  );
}

function ReferencePreviewModal({
  onClose,
  reference,
}: {
  onClose: () => void;
  reference: AttachedReferenceForTicket;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,35,31,0.42)] p-4 backdrop-blur-[2px]">
      <section className="max-h-[calc(100vh-32px)] w-full max-w-xl overflow-y-auto rounded-xl border border-[var(--rail-border)] bg-white shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--rail-border)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--signal-blue)]">
              Preview referensi
            </p>
            <h2 className="truncate text-sm font-semibold text-[var(--rail-ink)]">
              {reference.title}
            </h2>
          </div>
          <button
            aria-label="Tutup preview referensi"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={14} />
          </button>
        </header>
        <div className="space-y-3 p-4">
          <PreviewRow label="Usage type" value={reference.usageType} />
          <PreviewRow label="Catatan" value={reference.note ?? "-"} />
          <PreviewRow
            label="Tag"
            value={reference.tags.length > 0 ? reference.tags.join(", ") : "-"}
          />
          <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              Konten / Snapshot
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--rail-ink)]">
              {reference.content ??
                reference.snapshotText ??
                "Konten referensi tidak tersedia di closure context."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-[var(--background)] p-3 text-xs">
      <span className="w-24 shrink-0 text-[var(--text-muted)]">{label}</span>
      <span className="min-w-0 flex-1 break-words font-semibold text-[var(--rail-ink)]">
        {value}
      </span>
    </div>
  );
}

function TicketWorkspaceState({
  action,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <section className="flex min-h-[420px] flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center shadow-[var(--shadow-soft)]">
      <div className="flex max-w-md flex-col items-center gap-3">
        {icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]">
            {icon}
          </span>
        ) : null}
        <h2 className="text-base font-semibold text-[var(--rail-ink)]">
          {title}
        </h2>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
        {action}
      </div>
    </section>
  );
}
