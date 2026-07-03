"use client";

import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useManagerDashboard } from "../hooks/useManagerDashboard";
import { ComplaintCategoryCard } from "./manager/ComplaintCategoryCard";
import { ComplaintTrendCard } from "./manager/ComplaintTrendCard";
import { ManagerDashboardHeader } from "./manager/ManagerDashboardHeader";
import { ManagerSummarySection } from "./manager/ManagerSummarySection";

export function ManagerDashboard() {
  const { dashboardData, period, setPeriod, setTrendInterval, trendInterval } =
    useManagerDashboard();
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const dashboardMetrics = dashboardData.metrics.filter((metric) =>
    ["total-complaints", "resolved-complaints", "escalations"].includes(
      metric.id,
    ),
  );
  const totalComplaints =
    dashboardMetrics.find((metric) => metric.id === "total-complaints")
      ?.value ?? "0";
  const resolvedComplaints =
    dashboardMetrics.find((metric) => metric.id === "resolved-complaints")
      ?.value ?? "0";
  const escalations =
    dashboardMetrics.find((metric) => metric.id === "escalations")?.value ??
    "0";

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="manager"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Keluhan", value: totalComplaints },
            { label: "Selesai", value: resolvedComplaints },
            { label: "Eskalasi", value: escalations },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Manajer operasional"
            userName="Maya R."
          />

          <div className="grid gap-4">
            <ManagerDashboardHeader
              onPeriodChange={setPeriod}
              period={period}
            />
            <ManagerSummarySection metrics={dashboardMetrics} />

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
          </div>
        </section>
      </div>
    </main>
  );
}
