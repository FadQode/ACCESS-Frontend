"use client";

import { AlertTriangle, Eye, EyeOff, Info, RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { FeedbackDialog } from "@/core/components/feedback/feedback-dialog";
import { LoadingOverlay } from "@/core/components/feedback/loading-overlay";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useTicketWorkspace } from "../hooks/useTicketWorkspace";
import { TicketAssistPanel } from "./TicketAssistPanel";
import { TicketDetail } from "./TicketDetail";
import { TicketQueue } from "./TicketQueue";

export function TicketWorkspace() {
  const workspace = useTicketWorkspace();
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [assistPanelOpen, setAssistPanelOpen] = useState(false);

  const activeTicketCount = workspace.readyCount + workspace.waitingCount;
  const isAdminFinalClosure = sessionUser?.role === "admin";
  const canPerformFinalClosure = sessionUser?.role !== "manager";

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
                hasCopiedClosure={workspace.hasCopiedClosure}
                isAdminFinalClosure={isAdminFinalClosure}
                isFinalClosurePending={workspace.isFinalClosurePending}
                onAddInternalNote={workspace.addInternalNote}
                onClosureDraftChange={workspace.setClosureDraft}
                onCopyClosureAndClose={workspace.copyClosureAndClose}
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
    </main>
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
