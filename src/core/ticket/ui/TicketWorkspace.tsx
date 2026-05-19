"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useTicketWorkspace } from "../hooks/useTicketWorkspace";
import { TicketAssistPanel } from "./TicketAssistPanel";
import { TicketDetail } from "./TicketDetail";
import { TicketQueue } from "./TicketQueue";

export function TicketWorkspace() {
  const workspace = useTicketWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navbarVisible, setNavbarVisible] = useState(true);

  if (!workspace.selectedTicket) {
    return null;
  }

  const activeTicketCount = workspace.tickets.filter(
    (ticket) => ticket.status !== "closed",
  ).length;
  const escalatedCount = workspace.tickets.filter(
    (ticket) => ticket.escalated,
  ).length;

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          stats={[
            { label: "Active", value: activeTicketCount.toString() },
            { label: "Escalated", value: escalatedCount.toString() },
            { label: "Queue", value: workspace.tickets.length.toString() },
          ]}
        />

        <section className="relative flex h-[calc(100vh-40px)] min-h-[700px] min-w-0 flex-1 flex-col rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          {navbarVisible ? (
            <DashboardNavbar
              controls={
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                  onClick={() => setNavbarVisible(false)}
                  type="button"
                >
                  <EyeOff aria-hidden="true" size={15} />
                  Hide navbar
                </button>
              }
              dashboardRole="agent"
              isSidebarOpen={sidebarOpen}
              onSidebarToggle={() => setSidebarOpen((isOpen) => !isOpen)}
              roleLabel="Support agent"
              userName="Rizky A."
            />
          ) : (
            <button
              className="absolute right-5 top-5 z-20 inline-flex h-9 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow-soft)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              onClick={() => setNavbarVisible(true)}
              type="button"
            >
              <Eye aria-hidden="true" size={14} />
              Show navbar
            </button>
          )}

          <section className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-muted)] shadow-[var(--shadow-soft)]">
            <TicketQueue
              filter={workspace.filter}
              onFilterChange={workspace.setFilter}
              onSearchChange={workspace.setSearchQuery}
              onSelectTicket={workspace.setSelectedTicketId}
              searchQuery={workspace.searchQuery}
              selectedTicketId={workspace.selectedTicketId}
              tickets={workspace.tickets}
            />
            <TicketDetail
              onReplyModeChange={workspace.setReplyMode}
              onReplyTextChange={workspace.setReplyText}
              replyMode={workspace.replyMode}
              replyText={workspace.replyText}
              ticket={workspace.selectedTicket}
            />
            <TicketAssistPanel
              onUseSuggestedResponse={workspace.useSuggestedResponse}
              ticket={workspace.selectedTicket}
            />
          </section>
        </section>
      </div>
    </main>
  );
}
