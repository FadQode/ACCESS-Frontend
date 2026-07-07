"use client";

import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useComplaintStatusCounts } from "../hooks/use-complaint-status-counts";
import { useComplaints } from "../hooks/use-complaints";
import { useManagerDashboardSummary } from "../hooks/use-manager-dashboard-summary";
import type { Complaint } from "../model/types/complaint.types";
import type {
  ComplaintCategoryBreakdown,
  ManagerDashboardCards,
} from "../model/types/dashboard.types";
import type { ReportGroupBy } from "../model/types/dashboard-filter.types";
import { getDefaultDateRange } from "../model/utils/date.utils";
import { ComplaintCategoryCard } from "./manager/ComplaintCategoryCard";
import { ComplaintTrendCard } from "./manager/ComplaintTrendCard";
import { ManagerDashboardHeader } from "./manager/ManagerDashboardHeader";

const SKELETON_CATEGORY_ROWS = [
  "category-row-1",
  "category-row-2",
  "category-row-3",
  "category-row-4",
  "category-row-5",
];

const categoryLabel: Record<string, string> = {
  account: "Login / OTP / Akun",
  app_error: "Aplikasi Error / Lemot",
  app_update: "Update Aplikasi",
  cancellation: "Pembatalan",
  delay: "Keterlambatan",
  facility: "Fasilitas",
  lost_item: "Barang Tertinggal",
  no_response_cs: "CS Tidak Merespons",
  other: "Lainnya",
  payment: "Pembayaran",
  refund: "Pengembalian Dana",
  refund_cancel: "Refund / Pembatalan",
  queue_problem: "Antrian / Promo",
  ticket_booking: "Tiket / Booking",
  uncategorized: "Lainnya",
};

export function ManagerDashboard() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("day");

  const complaintStatusCounts = useComplaintStatusCounts();
  const allComplaintsQuery = useComplaints({ limit: 100, page: 1 });
  const chartSummary = useManagerDashboardSummary({
    period: "custom",
    from: fromDate,
    to: toDate,
    groupBy,
  });
  const overallCards = useMemo<ManagerDashboardCards>(() => {
    const resolvedComplaints =
      complaintStatusCounts.counts.resolved +
      complaintStatusCounts.counts.closed;

    return {
      escalatedComplaints: complaintStatusCounts.counts.waiting_action,
      resolvedComplaints,
      totalComplaints: complaintStatusCounts.counts.all,
    };
  }, [
    complaintStatusCounts.counts.all,
    complaintStatusCounts.counts.closed,
    complaintStatusCounts.counts.resolved,
    complaintStatusCounts.counts.waiting_action,
  ]);
  const overallCategories = useMemo(
    () => buildCategoryBreakdown(allComplaintsQuery.data?.items ?? []),
    [allComplaintsQuery.data?.items],
  );
  const categoryBreakdown =
    overallCategories.length > 0
      ? overallCategories
      : (chartSummary.data?.complaintsByCategory ?? []);
  const isCardsLoading = complaintStatusCounts.isLoading;
  const isCategoryLoading = allComplaintsQuery.isLoading && !chartSummary.data;
  const isCategoryError = allComplaintsQuery.isError && !chartSummary.data;

  const sidebarStats = [
    {
      label: "Keluhan",
      value: complaintStatusCounts.isLoading
        ? "..."
        : overallCards.totalComplaints.toString(),
    },
    {
      label: "Selesai",
      value: complaintStatusCounts.isLoading
        ? "..."
        : overallCards.resolvedComplaints.toString(),
    },
    {
      label: "Eskalasi",
      value: complaintStatusCounts.isLoading
        ? "..."
        : overallCards.escalatedComplaints.toString(),
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
            <ManagerDashboardHeader />

            {isCardsLoading ? (
              <section className="grid gap-3 md:grid-cols-3">
                <SkeletonMetric />
                <SkeletonMetric />
                <SkeletonMetric />
              </section>
            ) : (
              <section className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    id: "total-complaints",
                    label: "Total Keluhan",
                    value: overallCards.totalComplaints.toString(),
                  },
                  {
                    id: "resolved-complaints",
                    label: "Selesai",
                    value: overallCards.resolvedComplaints.toString(),
                  },
                  {
                    id: "escalations",
                    label: "Eskalasi",
                    value: overallCards.escalatedComplaints.toString(),
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
            )}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
              <div className="grid gap-4">
                <ChartRangeToolbar
                  from={fromDate}
                  onFromChange={setFromDate}
                  onToChange={setToDate}
                  to={toDate}
                />
                {chartSummary.isError ? (
                  <DashboardErrorState title="Gagal memuat grafik operasional." />
                ) : chartSummary.isLoading ? (
                  <SkeletonCard>
                    <div className="mb-3 flex gap-2">
                      <div className="h-3 w-24 animate-pulse rounded bg-[var(--rail-border)]" />
                      <div className="h-3 w-16 animate-pulse rounded bg-[var(--rail-border)]" />
                    </div>
                    <div className="h-[280px] animate-pulse rounded bg-[var(--rail-border)]" />
                  </SkeletonCard>
                ) : chartSummary.data ? (
                  <ComplaintTrendCard
                    data={chartSummary.data.complaintTrend}
                    groupBy={groupBy}
                    onGroupByChange={setGroupBy}
                  />
                ) : null}
              </div>

              {isCategoryError ? (
                <DashboardErrorState title="Gagal memuat kategori keseluruhan." />
              ) : isCategoryLoading ? (
                <SkeletonCard>
                  <div className="mb-3 h-3 w-32 animate-pulse rounded bg-[var(--rail-border)]" />
                  <div className="space-y-4">
                    {SKELETON_CATEGORY_ROWS.map((row) => (
                      <div key={row}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <div className="h-3 w-20 animate-pulse rounded bg-[var(--rail-border)]" />
                          <div className="h-3 w-8 animate-pulse rounded bg-[var(--rail-border)]" />
                        </div>
                        <div className="h-2.5 animate-pulse rounded-full bg-[var(--rail-border)]" />
                      </div>
                    ))}
                  </div>
                </SkeletonCard>
              ) : (
                <ComplaintCategoryCard categories={categoryBreakdown} />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ChartRangeToolbar({
  from,
  onFromChange,
  onToChange,
  to,
}: {
  from: string;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  to: string;
}) {
  return (
    <section className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
          Periode grafik
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)]">
            <CalendarDays aria-hidden="true" size={15} />
            Rentang
          </span>
          <input
            aria-label="Dari tanggal grafik"
            className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--rail-ink)] outline-none"
            onChange={(event) => onFromChange(event.target.value)}
            type="date"
            value={from}
          />
          <span className="text-xs text-[var(--text-muted)]">-</span>
          <input
            aria-label="Sampai tanggal grafik"
            className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--rail-ink)] outline-none"
            onChange={(event) => onToChange(event.target.value)}
            type="date"
            value={to}
          />
        </div>
      </div>
    </section>
  );
}

function buildCategoryBreakdown(
  complaints: Complaint[],
): ComplaintCategoryBreakdown[] {
  const counts = new Map<string, number>();
  const total = complaints.length;

  for (const complaint of complaints) {
    const category = complaint.category || "uncategorized";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({
      category,
      count,
      label: categoryLabel[category] ?? category,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((first, second) => second.count - first.count);
}

function DashboardErrorState({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] p-6 text-center">
      <p className="text-sm text-[var(--signal-red)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Silakan coba lagi.
      </p>
    </div>
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
