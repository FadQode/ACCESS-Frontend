"use client";

import { Filter, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import type {
  AgentPerformanceSnapshot,
  CaseOutcomeType,
  PerformancePeriod,
} from "@/core/dashboard/model/types/agent.types";

export function AgentReportPage({
  snapshots,
}: {
  snapshots: AgentPerformanceSnapshot[];
}) {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const [selectedPeriod, setSelectedPeriod] = useState<PerformancePeriod>(
    snapshots[0]?.period ?? "7d",
  );
  const [statusFilter, setStatusFilter] = useState<CaseOutcomeType | "all">(
    "all",
  );
  const [query, setQuery] = useState("");
  const snapshot =
    snapshots.find((item) => item.period === selectedPeriod) ?? snapshots[0];

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return snapshot.recentOutcomes.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.outcome === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.referenceNumber, item.category, item.outcome]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, snapshot.recentOutcomes, statusFilter]);

  const resolvedCount = snapshot.recentOutcomes.filter(
    (item) => item.outcome === "resolved",
  ).length;
  const escalatedCount = snapshot.recentOutcomes.filter(
    (item) => item.outcome === "escalated",
  ).length;

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            {
              label: "Handled",
              value: snapshot.recentOutcomes.length.toString(),
            },
            { label: "Resolved", value: resolvedCount.toString() },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Report agent"
            userName={snapshot.agentName}
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
            </header>

            <section className="grid gap-3 md:grid-cols-4">
              <ReportMetric
                label="Total handled"
                value={snapshot.recentOutcomes.length}
              />
              <ReportMetric label="Resolved" value={resolvedCount} />
              <ReportMetric label="Open" value={snapshot.metrics.activeCases} />
              <ReportMetric label="Escalated" value={escalatedCount} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
              <ReportPanel title="Resolution trend">
                <div className="grid h-[220px] grid-cols-7 items-end gap-2">
                  {snapshot.weeklyCases.map((item) => {
                    const maxValue = Math.max(
                      ...snapshot.weeklyCases.map(
                        (point) => point.resolvedCases,
                      ),
                      1,
                    );

                    return (
                      <div
                        className="flex h-full flex-col justify-end gap-2"
                        key={item.day}
                      >
                        <div className="flex flex-1 items-end rounded-lg bg-[var(--background)] px-2 py-2">
                          <div
                            className="w-full rounded-t-md bg-[var(--signal-green)]"
                            style={{
                              height: `${Math.max(
                                (item.resolvedCases / maxValue) * 100,
                                8,
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-center text-[10px] font-semibold text-[var(--text-muted)]">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ReportPanel>

              <ReportPanel title="Complaints by category">
                <div className="space-y-3">
                  {snapshot.categoryBreakdown.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-[var(--rail-ink)]">
                          {item.label}
                        </span>
                        <span className="font-semibold text-[var(--signal-blue)]">
                          {item.percent}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--background)]">
                        <div
                          className="h-full rounded-full bg-[var(--signal-blue)]"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ReportPanel>
            </section>

            <ReportPanel title="Daftar complaint / ticket">
              <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_160px_160px]">
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
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as CaseOutcomeType | "all",
                    )
                  }
                  value={statusFilter}
                >
                  <option value="all">Semua status</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
                <select
                  className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm outline-none"
                  onChange={(event) =>
                    setSelectedPeriod(event.target.value as PerformancePeriod)
                  }
                  value={selectedPeriod}
                >
                  {snapshots.map((item) => (
                    <option key={item.period} value={item.period}>
                      {item.periodLabel}
                    </option>
                  ))}
                </select>
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
                    {rows.map((row) => (
                      <tr
                        className="border-t border-[var(--rail-border)]"
                        key={row.referenceNumber}
                      >
                        <td className="px-3 py-3 font-semibold text-[var(--rail-ink)]">
                          {row.referenceNumber}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-muted)]">
                          {row.category}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-[var(--signal-blue-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
                            {row.outcome === "resolved"
                              ? "Selesai"
                              : "Eskalasi"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[var(--text-muted)]">
                          {row.resolvedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportPanel>
          </div>
        </section>
      </div>
    </main>
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
