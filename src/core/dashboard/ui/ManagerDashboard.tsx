"use client";

import { useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useManagerDashboard } from "../hooks/useManagerDashboard";
import { AgentPerformanceCard } from "./manager/AgentPerformanceCard";
import { ComplaintCategoryCard } from "./manager/ComplaintCategoryCard";
import { ComplaintTrendCard } from "./manager/ComplaintTrendCard";
import { ManagerDashboardHeader } from "./manager/ManagerDashboardHeader";
import { ManagerSummarySection } from "./manager/ManagerSummarySection";
import { OpenEscalationsCard } from "./manager/OpenEscalationsCard";

export function ManagerDashboard() {
  const { dashboardData, period, setPeriod, setTrendInterval, trendInterval } =
    useManagerDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="manager"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          stats={[
            { label: "Selesai", value: "231" },
            { label: "Dieskalasi", value: "18" },
            { label: "Kualitas", value: "82" },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((isOpen) => !isOpen)}
            roleLabel="Manajer operasional"
            userName="Maya R."
          />

          <div className="grid gap-4">
            <ManagerDashboardHeader
              onPeriodChange={setPeriod}
              period={period}
            />
            <ManagerSummarySection metrics={dashboardData.metrics} />

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
              <ComplaintTrendCard
                data={dashboardData.complaintTrend}
                interval={trendInterval}
                onIntervalChange={setTrendInterval}
              />
              <ComplaintCategoryCard
                categories={dashboardData.complaintCategories}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
              <AgentPerformanceCard agents={dashboardData.agentPerformance} />
              <OpenEscalationsCard
                escalations={dashboardData.openEscalations}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
