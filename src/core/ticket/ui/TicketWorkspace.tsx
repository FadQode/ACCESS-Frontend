"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
  const [navbarVisible, setNavbarVisible] = useState(true);

  if (!workspace.selectedTicket) {
    return null;
  }

  const activeTicketCount = workspace.readyCount + workspace.waitingCount;

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Aktif", value: activeTicketCount.toString() },
            { label: "Siap", value: workspace.readyCount.toString() },
            { label: "Menunggu", value: workspace.waitingCount.toString() },
          ]}
        />

        <section className="relative flex min-h-[700px] min-w-0 flex-1 flex-col rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5 xl:h-[calc(100vh-40px)]">
          {navbarVisible ? (
            <DashboardNavbar
              controls={
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                  onClick={() => setNavbarVisible(false)}
                  type="button"
                >
                  <EyeOff aria-hidden="true" size={15} />
                  Sembunyikan navbar
                </button>
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

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-muted)] shadow-[var(--shadow-soft)] xl:flex-row">
            <TicketQueue
              filter={workspace.filter}
              onFilterChange={workspace.setFilter}
              onSearchChange={workspace.setSearchQuery}
              onSelectTicket={workspace.setSelectedTicketId}
              readyCount={workspace.readyCount}
              searchQuery={workspace.searchQuery}
              selectedTicketId={workspace.selectedTicketId}
              tickets={workspace.tickets}
              waitingCount={workspace.waitingCount}
            />
            <TicketDetail
              closureDraft={workspace.closureDraft}
              hasCopiedClosure={workspace.hasCopiedClosure}
              onAddInternalNote={workspace.addInternalNote}
              onClosureDraftChange={workspace.setClosureDraft}
              onCopyClosureAndClose={workspace.copyClosureAndClose}
              ticket={workspace.selectedTicket}
            />
            <TicketAssistPanel ticket={workspace.selectedTicket} />
          </section>
        </section>
      </div>
    </main>
  );
}
