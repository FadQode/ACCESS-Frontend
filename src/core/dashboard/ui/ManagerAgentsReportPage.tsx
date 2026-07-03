"use client";

import { Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useAgentPerformanceReport } from "../hooks/use-agent-performance-report";
import type { ReportPeriod } from "../model/types/dashboard-filter.types";

const SKELETON_AGENT_ROWS = [
  "agent-row-1",
  "agent-row-2",
  "agent-row-3",
  "agent-row-4",
  "agent-row-5",
];

export function ManagerAgentsReportPage() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<ReportPeriod>("30d");

  const { data, error, isLoading } = useAgentPerformanceReport({
    period,
    groupBy: "day",
  });

  const agents = useMemo(() => {
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return data.agents.filter((agent) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [agent.agentName, agent.agentEmail]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesQuery;
    });
  }, [data, query]);

  const totalResolved = data
    ? data.agents.reduce((sum, agent) => sum + agent.resolvedCount, 0)
    : 0;
  const totalEscalated = data
    ? data.agents.reduce((sum, agent) => sum + agent.escalatedCount, 0)
    : 0;
  const totalOpen = data
    ? data.agents.reduce((sum, agent) => sum + agent.openCount, 0)
    : 0;

  const sidebarStats = [
    {
      label: "Agent",
      value: isLoading ? "..." : (data?.agents.length ?? 0).toString(),
    },
    {
      label: "Selesai",
      value: isLoading ? "..." : totalResolved.toString(),
    },
    {
      label: "Eskalasi",
      value: isLoading ? "..." : totalEscalated.toString(),
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
            roleLabel="Report manager"
            userName={sessionUser?.name ?? "Manager"}
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
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                    <UsersRound aria-hidden="true" size={15} />
                    {isLoading ? "..." : `${data?.agents.length ?? 0} agent`}
                  </span>
                  <select
                    className="h-10 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)] outline-none"
                    onChange={(event) =>
                      setPeriod(event.target.value as ReportPeriod)
                    }
                    value={period}
                  >
                    <option value="7d">7 hari terakhir</option>
                    <option value="30d">30 hari terakhir</option>
                    <option value="90d">90 hari terakhir</option>
                  </select>
                </div>
              </div>
            </header>

            {error ? (
              <div className="rounded-xl border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] p-6 text-center">
                <p className="text-sm text-[var(--signal-red)]">
                  Gagal memuat performa agent.
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

                <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
                  <div className="mb-4">
                    <div className="h-10 w-full animate-pulse rounded-lg bg-[var(--rail-border)]" />
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
                          <th className="px-3 py-3">Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SKELETON_AGENT_ROWS.map((row) => (
                          <tr
                            className="border-t border-[var(--rail-border)]"
                            key={row}
                          >
                            <td className="px-3 py-3">
                              <div className="flex animate-pulse items-center gap-2">
                                <div className="h-9 w-9 rounded-full bg-[var(--rail-border)]" />
                                <div>
                                  <div className="mb-1 h-4 w-24 rounded bg-[var(--rail-border)]" />
                                  <div className="h-3 w-16 rounded bg-[var(--rail-border)]" />
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-8 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-8 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-8 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-20 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                            <td className="px-3 py-3">
                              <div className="h-4 w-16 animate-pulse rounded bg-[var(--rail-border)]" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : data && data.agents.length > 0 ? (
              <>
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
                          <th className="px-3 py-3">Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.length > 0 ? (
                          agents.map((agent) => (
                            <tr
                              className="border-t border-[var(--rail-border)]"
                              key={agent.agentId}
                            >
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--signal-blue)] text-xs font-semibold text-white">
                                    {getInitials(agent.agentName)}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-[var(--rail-ink)]">
                                      {agent.agentName}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-muted)]">
                                      {agent.isActive ? "Active" : "Inactive"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 font-semibold text-[var(--rail-ink)]">
                                {agent.resolvedCount}
                              </td>
                              <td className="px-3 py-3 text-[var(--text-muted)]">
                                {agent.openCount}
                              </td>
                              <td className="px-3 py-3 text-[var(--text-muted)]">
                                {agent.escalatedCount}
                              </td>
                              <td className="px-3 py-3 text-[var(--text-muted)]">
                                {agent.topCategory || "-"}
                              </td>
                              <td className="px-3 py-3 text-[var(--text-muted)]">
                                {agent.lastActivityAt
                                  ? new Date(
                                      agent.lastActivityAt,
                                    ).toLocaleDateString("id-ID")
                                  : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-3 py-8 text-center text-sm text-[var(--text-muted)]"
                              colSpan={6}
                            >
                              Tidak ada agent yang cocok dengan pencarian.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : (
              <div className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  Belum ada data performa agent pada periode ini.
                </p>
              </div>
            )}
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

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
