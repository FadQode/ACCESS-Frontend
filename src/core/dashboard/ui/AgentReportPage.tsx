"use client";

import { CalendarDays, Filter, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useCurrentUser } from "../hooks/use-current-user";
import { useSingleAgentReport } from "../hooks/use-single-agent-report";
import type { ReportGroupBy } from "../model/types/dashboard-filter.types";
import type {
  ComplaintCategory,
  ComplaintStatus,
} from "../model/types/reports.types";
import { getDefaultDateRange } from "../model/utils/date.utils";

const SKELETON_TREND_HEIGHTS = [
  { handled: 62, id: "day-1", resolved: 42 },
  { handled: 48, id: "day-2", resolved: 33 },
  { handled: 78, id: "day-3", resolved: 58 },
  { handled: 55, id: "day-4", resolved: 38 },
  { handled: 86, id: "day-5", resolved: 64 },
  { handled: 70, id: "day-6", resolved: 51 },
  { handled: 60, id: "day-7", resolved: 45 },
];
const SKELETON_CASE_ROWS = [
  "case-row-1",
  "case-row-2",
  "case-row-3",
  "case-row-4",
  "case-row-5",
];

export function AgentReportPage() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data ?? sessionUser;
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("day");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<
    ComplaintCategory | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, error, isLoading, isFetching } = useSingleAgentReport(
    currentUser?.id ?? "",
    {
      period: "custom",
      from: fromDate,
      to: toDate,
      groupBy,
      status: statusFilter === "all" ? undefined : statusFilter,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      page,
      limit: 20,
    },
  );

  const sidebarStats = [
    {
      label: "Handled",
      value: isLoading ? "..." : (data?.summary.handledCount ?? 0).toString(),
    },
    {
      label: "Resolved",
      value: isLoading ? "..." : (data?.summary.resolvedCount ?? 0).toString(),
    },
  ];

  // Local search filter for current page
  const filteredRows =
    data?.recentCases.items.filter((item) => {
      const normalizedQuery = query.trim().toLowerCase();
      if (normalizedQuery.length === 0) return true;

      return [item.referenceNo, item.category, item.complaintStatus]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    }) ?? [];

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={sidebarStats}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Report agent"
            userName={
              isLoading
                ? "Agent"
                : (data?.agent.name ?? currentUser?.name ?? "Agent")
            }
          />

          <div className="grid gap-4">
            <header className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                Single agent report
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                Riwayat dan penyelesaian saya
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Halaman detail untuk melihat kasus yang ditangani, status
                penyelesaian, kategori, dan tren pekerjaan.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                  <CalendarDays aria-hidden="true" size={15} />
                  Rentang
                </span>
                <input
                  aria-label="Dari tanggal"
                  className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--rail-ink)] outline-none"
                  onChange={(e) => setFromDate(e.target.value)}
                  type="date"
                  value={fromDate}
                />
                <span className="text-xs text-[var(--text-muted)]">—</span>
                <input
                  aria-label="Sampai tanggal"
                  className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--rail-ink)] outline-none"
                  onChange={(e) => setToDate(e.target.value)}
                  type="date"
                  value={toDate}
                />
              </div>
            </header>

            {error ? (
              <div className="rounded-xl border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] p-6 text-center">
                <p className="text-sm text-[var(--signal-red)]">
                  Gagal memuat report agent.
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

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
                  <ReportPanel title="Resolution trend">
                    <SkeletonTrendBars />
                  </ReportPanel>
                  <ReportPanel title="Complaints by category">
                    <div className="space-y-3">
                      <SkeletonCategoryBar />
                      <SkeletonCategoryBar />
                      <SkeletonCategoryBar />
                    </div>
                  </ReportPanel>
                </section>

                <ReportPanel title="Daftar complaint / ticket">
                  <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                    <div className="h-10 animate-pulse rounded-lg bg-[var(--rail-border)]" />
                    <div className="h-10 animate-pulse rounded-lg bg-[var(--rail-border)]" />
                    <div className="h-10 animate-pulse rounded-lg bg-[var(--rail-border)]" />
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[var(--rail-border)]">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[var(--background)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                        <tr>
                          <th className="px-3 py-3">Ticket</th>
                          <th className="px-3 py-3">Kategori</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-3 py-3">Waktu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SKELETON_CASE_ROWS.map((row) => (
                          <tr
                            className="border-t border-[var(--rail-border)]"
                            key={row}
                          >
                            <td className="px-3 py-3">
                              <div className="h-4 w-24 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-20 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-16 animate-pulse rounded-full bg-[var(--rail-border)]" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-16 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ReportPanel>
              </>
            ) : data ? (
              <>
                <section className="grid gap-3 md:grid-cols-3">
                  <ReportMetric
                    label="Total ditangani"
                    value={data.summary.handledCount}
                  />
                  <ReportMetric
                    label="Selesai"
                    value={data.summary.resolvedCount}
                  />
                  <ReportMetric
                    label="Eskalasi"
                    value={data.summary.escalatedCount}
                  />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
                  <ReportPanel title="Resolution trend">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-4">
                        <Legend color="var(--signal-blue)" label="Handled" />
                        <Legend color="var(--signal-green)" label="Resolved" />
                      </div>
                      <div className="flex rounded-full border border-[var(--rail-border)] bg-[var(--background)] p-1">
                        {[
                          { label: "Harian", value: "day" as const },
                          { label: "Mingguan", value: "week" as const },
                        ].map((item) => (
                          <button
                            className={`h-7 rounded-full px-3 text-[10px] font-semibold transition ${
                              groupBy === item.value
                                ? "bg-[var(--surface-panel)] text-[var(--rail-ink)] shadow-sm"
                                : "text-[var(--text-muted)] hover:text-[var(--rail-ink)]"
                            }`}
                            key={item.value}
                            onClick={() => setGroupBy(item.value)}
                            type="button"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.resolutionTrend.slice(0, 7)}
                          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                          barGap={4}
                          barCategoryGap="20%"
                        >
                          <XAxis
                            dataKey="bucket"
                            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                            axisLine={{ stroke: "var(--rail-border)" }}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "var(--surface-panel)",
                              border: "1px solid var(--rail-border)",
                              borderRadius: 8,
                              fontSize: 13,
                              color: "var(--rail-ink)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                          />
                          <Bar
                            dataKey="handledCount"
                            fill="var(--signal-blue)"
                            name="Handled"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={24}
                          />
                          <Bar
                            dataKey="resolvedCount"
                            fill="var(--signal-green)"
                            name="Resolved"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={24}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ReportPanel>

                  <ReportPanel title="Complaints by category">
                    <div className="space-y-3">
                      {data.complaintsByCategory.map((item) => (
                        <div key={item.category}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-[var(--rail-ink)]">
                              {item.label}
                            </span>
                            <div className="flex gap-2">
                              <span className="font-medium text-[var(--text-muted)]">
                                {item.count}
                              </span>
                              <span className="font-semibold text-[var(--signal-blue)]">
                                {item.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--background)]">
                            <div
                              className="h-full rounded-full bg-[var(--signal-blue)]"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ReportPanel>
                </section>

                <ReportPanel title="Daftar complaint / ticket">
                  <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                    <label className="relative">
                      <span className="sr-only">Cari ticket</span>
                      <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                        size={15}
                      />
                      <input
                        className="h-10 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-sm outline-none focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari nomor atau kategori"
                        value={query}
                      />
                    </label>
                    <select
                      className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm outline-none"
                      onChange={(event) => {
                        setStatusFilter(
                          event.target.value as ComplaintStatus | "all",
                        );
                        setPage(1);
                      }}
                      value={statusFilter}
                    >
                      <option value="all">Semua status</option>
                      <option value="submitted">Submitted</option>
                      <option value="waiting_action">Waiting Action</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm outline-none"
                      onChange={(event) => {
                        setCategoryFilter(
                          event.target.value as ComplaintCategory | "all",
                        );
                        setPage(1);
                      }}
                      value={categoryFilter}
                    >
                      <option value="all">Semua kategori</option>
                      <option value="delay">Delay</option>
                      <option value="refund">Refund</option>
                      <option value="cancellation">Cancellation</option>
                      <option value="lost_item">Lost Item</option>
                      <option value="facility">Facility</option>
                      <option value="payment">Payment</option>
                      <option value="account">Account</option>
                      <option value="app_error">App Error</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {isFetching && !isLoading ? (
                    <div className="rounded-lg border border-[var(--rail-border)] p-8 text-center">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-[var(--rail-border)] border-t-[var(--signal-blue)]" />
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        Memuat ulang...
                      </p>
                    </div>
                  ) : filteredRows.length > 0 ? (
                    <>
                      <div className="overflow-x-auto rounded-lg border border-[var(--rail-border)]">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-[var(--background)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                            <tr>
                              <th className="px-3 py-3">Ticket</th>
                              <th className="px-3 py-3">Kategori</th>
                              <th className="px-3 py-3">Status</th>
                              <th className="px-3 py-3">Waktu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRows.map((row) => (
                              <tr
                                className="border-t border-[var(--rail-border)]"
                                key={row.complaintId}
                              >
                                <td className="px-3 py-3 font-semibold text-[var(--rail-ink)]">
                                  {row.referenceNo}
                                </td>
                                <td className="px-3 py-3 text-[var(--text-muted)]">
                                  {row.category}
                                </td>
                                <td className="px-3 py-3">
                                  <span className="rounded-full bg-[var(--signal-blue-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
                                    {row.complaintStatus}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-[var(--text-muted)]">
                                  {new Date(row.createdAt).toLocaleDateString(
                                    "id-ID",
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {data.recentCases.pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs text-[var(--text-muted)]">
                            Halaman {data.recentCases.pagination.page} dari{" "}
                            {data.recentCases.pagination.totalPages} (
                            {data.recentCases.pagination.total} total)
                          </p>
                          <div className="flex gap-2">
                            <button
                              className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-2 text-xs font-medium disabled:opacity-50"
                              disabled={page === 1}
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              type="button"
                            >
                              Sebelumnya
                            </button>
                            <button
                              className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-2 text-xs font-medium disabled:opacity-50"
                              disabled={
                                page >= data.recentCases.pagination.totalPages
                              }
                              onClick={() => setPage((p) => p + 1)}
                              type="button"
                            >
                              Berikutnya
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg border border-[var(--rail-border)] p-8 text-center text-sm text-[var(--text-muted)]">
                      Tidak ada kasus yang cocok dengan filter.
                    </div>
                  )}
                </ReportPanel>
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
      <div className="h-8 w-12 rounded bg-[var(--rail-border)]" />
    </article>
  );
}

function SkeletonTrendBars() {
  return (
    <div className="flex h-[220px] items-end gap-2">
      {SKELETON_TREND_HEIGHTS.map((height) => (
        <div
          className="flex h-full flex-1 flex-col justify-end gap-2"
          key={height.id}
        >
          <div className="flex flex-1 items-end justify-center gap-1 rounded-lg bg-[var(--background)] px-1 py-2">
            <div
              className={`w-3 rounded-t-md bg-[var(--rail-border)]`}
              style={{ height: `${height.handled}%` }}
            />
            <div
              className={`w-3 rounded-t-md bg-[var(--rail-border)]`}
              style={{ height: `${height.resolved}%` }}
            />
          </div>
          <div className="mx-auto h-3 w-6 rounded bg-[var(--rail-border)]" />
        </div>
      ))}
    </div>
  );
}

function SkeletonCategoryBar() {
  return (
    <div className="animate-pulse">
      <div className="mb-1 flex items-center justify-between text-xs">
        <div className="h-3 w-24 rounded bg-[var(--rail-border)]" />
        <div className="h-3 w-12 rounded bg-[var(--rail-border)]" />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--rail-border)]" />
    </div>
  );
}

function ReportMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </article>
  );
}

function ReportPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center gap-2">
        <Filter
          aria-hidden="true"
          className="text-[var(--signal-blue)]"
          size={15}
        />
        <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
