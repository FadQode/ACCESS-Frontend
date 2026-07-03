"use client";

import { CheckCircle2, CircleDot } from "lucide-react";
import type { ReactNode } from "react";
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
import { useAgentDashboardSummary } from "../hooks/use-agent-dashboard-summary";

const SKELETON_CHART_HEIGHTS = [
  { height: 44, id: "day-1" },
  { height: 58, id: "day-2" },
  { height: 72, id: "day-3" },
  { height: 51, id: "day-4" },
  { height: 86, id: "day-5" },
  { height: 63, id: "day-6" },
  { height: 48, id: "day-7" },
];

export function AgentDashboard() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();

  const { data, error, isLoading } = useAgentDashboardSummary({
    period: "7d",
    groupBy: "day",
  });

  const sidebarStats = [
    {
      label: "Selesai",
      value: isLoading ? "..." : (data?.cards.resolvedCount ?? 0).toString(),
    },
    {
      label: "Terbuka",
      value: isLoading ? "..." : (data?.cards.openCount ?? 0).toString(),
    },
  ];

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
            roleLabel="Agen dukungan"
            userName={sessionUser?.name ?? "Agent"}
          />

          <div className="grid gap-4">
            <header className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                  Dashboard agent
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                  Ringkasan pekerjaan saya
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  Ringkasan 7 hari terakhir — kasus selesai, kasus terbuka, dan
                  tren penyelesaian harian.
                </p>
              </div>
            </header>

            {error ? (
              <div className="rounded-xl border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] p-6 text-center">
                <p className="text-sm text-[var(--signal-red)]">
                  Gagal memuat ringkasan agent.
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Silakan coba lagi.
                </p>
              </div>
            ) : data ? (
              <>
                <section className="grid gap-3 md:grid-cols-2">
                  <SummaryCard
                    detail={`${data.resolutionSummary.resolvedInPeriod} selesai pada 7 hari terakhir`}
                    icon={<CheckCircle2 aria-hidden="true" size={20} />}
                    label="Kasus selesai"
                    tone="green"
                    value={data.cards.resolvedCount.toString()}
                  />
                  <SummaryCard
                    detail={`${data.cards.openCount} kasus masih terbuka`}
                    icon={<CircleDot aria-hidden="true" size={20} />}
                    label="Kasus terbuka"
                    tone="blue"
                    value={data.cards.openCount.toString()}
                  />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
                  <Panel title="Tren penyelesaian">
                    <div className="mb-4 flex flex-wrap gap-4">
                      <Legend color="var(--signal-green)" label="Selesai" />
                    </div>
                    <AgentCompletionChart data={data.resolutionTrend} />
                  </Panel>

                  <Panel title="Ringkasan periode">
                    <div className="space-y-3">
                      <MiniRow
                        label="Total selesai"
                        value={data.resolutionSummary.resolvedInPeriod}
                      />
                      <MiniRow
                        label="Masih terbuka"
                        value={data.cards.openCount}
                      />
                      <MiniRow
                        label="Periode"
                        value={`${data.period.from} - ${data.period.to}`}
                      />
                    </div>
                    <div className="mt-4 rounded-lg border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] p-3 text-xs leading-5 text-[var(--signal-blue)]">
                      Untuk filter tanggal dan tampilan mingguan, buka menu
                      Reports.
                    </div>
                  </Panel>
                </section>
              </>
            ) : isLoading ? (
              <>
                <section className="grid gap-3 md:grid-cols-2">
                  <SkeletonCard />
                  <SkeletonCard />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
                  <Panel title="Tren penyelesaian">
                    <SkeletonChart />
                  </Panel>
                  <Panel title="Ringkasan periode">
                    <div className="space-y-3">
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </div>
                  </Panel>
                </section>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function SkeletonCard() {
  return (
    <article className="animate-pulse rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-5 h-10 w-10 rounded-full bg-[var(--rail-border)]" />
      <div className="mb-2 h-8 w-20 rounded bg-[var(--rail-border)]" />
      <div className="mb-1 h-4 w-28 rounded bg-[var(--rail-border)]" />
      <div className="h-3 w-40 rounded bg-[var(--rail-border)]" />
    </article>
  );
}

function SkeletonChart() {
  return (
    <div className="flex h-[260px] items-end gap-2">
      {SKELETON_CHART_HEIGHTS.map((item) => (
        <div className="flex flex-1 flex-col justify-end gap-2" key={item.id}>
          <div className="flex flex-1 items-end justify-center rounded-lg bg-[var(--background)] px-2 py-2">
            <div
              className="w-8 rounded-t-md bg-[var(--rail-border)]"
              style={{ height: `${item.height}%` }}
            />
          </div>
          <div className="mx-auto h-3 w-6 rounded bg-[var(--rail-border)]" />
        </div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center justify-between gap-3 rounded-lg bg-[var(--background)] px-3 py-2">
      <div className="h-3 w-24 rounded bg-[var(--rail-border)]" />
      <div className="h-4 w-12 rounded bg-[var(--rail-border)]" />
    </div>
  );
}

function SummaryCard({
  detail,
  icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  tone: "blue" | "green";
  value: string;
}) {
  return (
    <article className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-full ${
          tone === "green"
            ? "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
            : "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
        }`}
      >
        {icon}
      </div>
      <p className="text-3xl font-semibold text-[var(--rail-ink)]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--rail-ink)]">
        {label}
      </p>
      <p className="mt-2 text-xs text-[var(--text-muted)]">{detail}</p>
    </article>
  );
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <h2 className="mb-3 text-sm font-semibold text-[var(--rail-ink)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AgentCompletionChart({
  data,
}: {
  data: Array<{ bucket: string; resolvedCount: number }>;
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
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
            dataKey="resolvedCount"
            fill="var(--signal-green)"
            name="Selesai"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
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

function MiniRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--background)] px-3 py-2">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--rail-ink)]">
        {value}
      </span>
    </div>
  );
}
