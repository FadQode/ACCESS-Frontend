"use client";

import { useState } from "react";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useManagerDashboardSummary } from "../hooks/use-manager-dashboard-summary";
import type { ReportGroupBy } from "../model/types/dashboard-filter.types";
import { getDefaultDateRange } from "../model/utils/date.utils";
import { ComplaintCategoryCard } from "./manager/ComplaintCategoryCard";
import { ComplaintTrendCard } from "./manager/ComplaintTrendCard";
import { ManagerDashboardHeader } from "./manager/ManagerDashboardHeader";

export function ManagerDashboard() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("day");

  const { data, error, isLoading } = useManagerDashboardSummary({
    period: "custom",
    from: fromDate,
    to: toDate,
    groupBy,
  });

  const sidebarStats = [
    {
      label: "Keluhan",
      value: isLoading ? "..." : (data?.cards.totalComplaints ?? 0).toString(),
    },
    {
      label: "Selesai",
      value: isLoading
        ? "..."
        : (data?.cards.resolvedComplaints ?? 0).toString(),
    },
    {
      label: "Eskalasi",
      value: isLoading
        ? "..."
        : (data?.cards.escalatedComplaints ?? 0).toString(),
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="manager"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={sidebarStats}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Manajer operasional"
            userName={sessionUser?.name ?? "Manager"}
          />

          <div className="grid gap-4">
            <ManagerDashboardHeader
              from={fromDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
              to={toDate}
            />

            {error ? (
              <div className="rounded-xl border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] p-6 text-center">
                <p className="text-sm text-[var(--signal-red)]">
                  Gagal memuat overview operasional.
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Silakan coba lagi.
                </p>
              </div>
            ) : isLoading ? (
              <>
                <section className="grid gap-3 md:grid-cols-3">
                  <SkeletonMetric />
                  <SkeletonMetric />
                  <SkeletonMetric />
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                  <SkeletonCard>
                    <div className="mb-3 flex gap-2">
                      <div className="h-3 w-24 animate-pulse rounded bg-[var(--rail-border)]" />
                      <div className="h-3 w-16 animate-pulse rounded bg-[var(--rail-border)]" />
                    </div>
                    <div className="h-[280px] animate-pulse rounded bg-[var(--rail-border)]" />
                  </SkeletonCard>
                  <SkeletonCard>
                    <div className="mb-3 h-3 w-32 animate-pulse rounded bg-[var(--rail-border)]" />
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <div className="h-3 w-20 animate-pulse rounded bg-[var(--rail-border)]" />
                            <div className="h-3 w-8 animate-pulse rounded bg-[var(--rail-border)]" />
                          </div>
                          <div className="h-2.5 animate-pulse rounded-full bg-[var(--rail-border)]" />
                        </div>
                      ))}
                    </div>
                  </SkeletonCard>
                </div>
              </>
            ) : data ? (
              <>
                <section className="grid gap-3 md:grid-cols-3">
                  {[
                    {
                      id: "total-complaints",
                      label: "Total Keluhan",
                      value: data.cards.totalComplaints.toString(),
                    },
                    {
                      id: "resolved-complaints",
                      label: "Selesai",
                      value: data.cards.resolvedComplaints.toString(),
                    },
                    {
                      id: "escalations",
                      label: "Eskalasi",
                      value: data.cards.escalatedComplaints.toString(),
                    },
                  ].map((metric) => (
                    <article
                      className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]"
                      key={metric.id}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                        {metric.value}
                      </p>
                    </article>
                  ))}
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                  <ComplaintTrendCard
                    data={data.complaintTrend}
                    groupBy={groupBy}
                    onGroupByChange={setGroupBy}
                  />
                  <ComplaintCategoryCard
                    categories={data.complaintsByCategory}
                  />
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function SkeletonMetric() {
  return (
    <article className="animate-pulse rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-2 h-3 w-20 rounded bg-[var(--rail-border)]" />
      <div className="h-8 w-16 rounded bg-[var(--rail-border)]" />
    </article>
  );
}

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      {children}
    </section>
  );
}
