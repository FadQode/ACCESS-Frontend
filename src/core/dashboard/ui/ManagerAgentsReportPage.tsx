"use client";

import { Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import type { ManagerDashboardData } from "@/core/dashboard/model/manager-dashboard.types";

export function ManagerAgentsReportPage({
  data,
}: {
  data: ManagerDashboardData;
}) {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "needs-review" | "on-target"
  >("all");

  const agents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.agentPerformance.filter((agent) => {
      const matchesStatus =
        statusFilter === "all" || agent.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [agent.name, agent.initials, agent.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [data.agentPerformance, query, statusFilter]);

  const totalResolved = data.agentPerformance.reduce(
    (sum, agent) => sum + agent.resolvedCount,
    0,
  );
  const totalEscalated = data.agentPerformance.reduce(
    (sum, agent) => sum + agent.escalationCount,
    0,
  );
  const totalOpen = data.agentPerformance.reduce(
    (sum, agent) =>
      sum + getOpenCount(agent.resolvedCount, agent.escalationCount),
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="manager"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Agent", value: data.agentPerformance.length.toString() },
            { label: "Selesai", value: totalResolved.toString() },
            { label: "Eskalasi", value: totalEscalated.toString() },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="manager"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Report manager"
            userName="Maya R."
          />

          <div className="grid gap-4">
            <header className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                    Agent performance report
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                    Performa agent
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    Halaman report untuk review detail per agent. Metric waktu
                    respons lanjutan bisa masuk di sini nanti, bukan di overview
                    utama.
                  </p>
                </div>
                <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                  <UsersRound aria-hidden="true" size={15} />
                  {data.agentPerformance.length} agent
                </span>
              </div>
            </header>

            <section className="grid gap-3 md:grid-cols-3">
              <ReportCard label="Kasus selesai" value={totalResolved} />
              <ReportCard label="Kasus terbuka" value={totalOpen} />
              <ReportCard label="Eskalasi" value={totalEscalated} />
            </section>

            <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_190px]">
                <label className="relative">
                  <span className="sr-only">Cari agent</span>
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                    size={15}
                  />
                  <input
                    className="h-10 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] pl-9 pr-3 text-sm outline-none focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari nama agent"
                    value={query}
                  />
                </label>
                <select
                  className="h-10 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-sm outline-none"
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "all"
                        | "needs-review"
                        | "on-target",
                    )
                  }
                  value={statusFilter}
                >
                  <option value="all">Semua agent</option>
                  <option value="on-target">On target</option>
                  <option value="needs-review">Needs review</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--rail-border)]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--background)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-3">Agent</th>
                      <th className="px-3 py-3">Selesai</th>
                      <th className="px-3 py-3">Terbuka</th>
                      <th className="px-3 py-3">Eskalasi</th>
                      <th className="px-3 py-3">Kategori dominan</th>
                      <th className="px-3 py-3">Tren</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent, index) => (
                      <tr
                        className="border-t border-[var(--rail-border)]"
                        key={agent.id}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--signal-blue)] text-xs font-semibold text-white">
                              {agent.initials}
                            </span>
                            <div>
                              <p className="font-semibold text-[var(--rail-ink)]">
                                {agent.name}
                              </p>
                              <p className="text-[11px] text-[var(--text-muted)]">
                                {agent.status === "on-target"
                                  ? "On target"
                                  : "Needs review"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-semibold text-[var(--rail-ink)]">
                          {agent.resolvedCount}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-muted)]">
                          {getOpenCount(
                            agent.resolvedCount,
                            agent.escalationCount,
                          )}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-muted)]">
                          {agent.escalationCount}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-muted)]">
                          {dominantCategory(index)}
                        </td>
                        <td className="px-3 py-3">
                          <MiniTrend value={agent.resolvedCount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function ReportCard({ label, value }: { label: string; value: number }) {
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

function MiniTrend({ value }: { value: number }) {
  const bars = [0.45, 0.62, 0.54, 0.76, 0.88].map((ratio, index) => ({
    height: Math.max(10, Math.round((value * ratio) / 2)),
    key: index,
  }));

  return (
    <div className="flex h-10 items-end gap-1">
      {bars.map((bar) => (
        <span
          className="w-2 rounded-t bg-[var(--signal-green)]"
          key={bar.key}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  );
}

function getOpenCount(resolvedCount: number, escalationCount: number) {
  return Math.max(2, Math.round(resolvedCount * 0.18) + escalationCount);
}

function dominantCategory(index: number) {
  const categories = [
    "Keterlambatan",
    "Pengembalian Dana",
    "Pembatalan",
    "Fasilitas",
    "Pembayaran",
  ];

  return categories[index % categories.length];
}
