"use client";

import { CalendarDays, CheckCircle2, CircleDot } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import type {
  AgentPerformanceSnapshot,
  PerformancePeriod,
  WeeklyCasePoint,
} from "@/core/dashboard/model/types/agent.types";

export interface AgentDashboardProps {
  snapshots: AgentPerformanceSnapshot[];
}

export function AgentDashboard({ snapshots }: AgentDashboardProps) {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const [selectedPeriod, setSelectedPeriod] = useState<PerformancePeriod>(
    snapshots[0]?.period ?? "7d",
  );
  const snapshot = useMemo(
    () =>
      snapshots.find((item) => item.period === selectedPeriod) ?? snapshots[0],
    [selectedPeriod, snapshots],
  );

  if (!snapshot) {
    return null;
  }

  const completedTotal = snapshot.weeklyCases.reduce(
    (sum, item) => sum + item.resolvedCases,
    0,
  );
  const incomingTotal = snapshot.weeklyCases.reduce(
    (sum, item) => sum + item.newCases,
    0,
  );
  const openCases = snapshot.metrics.activeCases;

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Selesai", value: completedTotal.toString() },
            { label: "Terbuka", value: openCases.toString() },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            controls={
              <select
                aria-label="Pilih periode dashboard"
                className="h-10 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)] outline-none transition focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
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
            }
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Agen dukungan"
            userName={snapshot.agentName}
          />

          <div className="grid gap-4">
            <header className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                    Dashboard agent
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                    Ringkasan pekerjaan saya
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    Fokus pada kasus selesai, kasus terbuka, dan tren
                    penyelesaian dalam periode aktif.
                  </p>
                </div>
                <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                  <CalendarDays aria-hidden="true" size={15} />
                  {snapshot.periodLabel}
                </span>
              </div>
            </header>

            <section className="grid gap-3 md:grid-cols-2">
              <SummaryCard
                detail={`${completedTotal} selesai pada periode ini`}
                icon={<CheckCircle2 aria-hidden="true" size={20} />}
                label="Kasus selesai"
                tone="green"
                value={completedTotal.toString()}
              />
              <SummaryCard
                detail={`${incomingTotal} kasus masuk pada periode ini`}
                icon={<CircleDot aria-hidden="true" size={20} />}
                label="Kasus terbuka"
                tone="blue"
                value={openCases.toString()}
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
              <Panel title="Tren penyelesaian">
                <div className="mb-4 flex flex-wrap gap-4">
                  <Legend color="var(--signal-blue)" label="Masuk" />
                  <Legend color="var(--signal-green)" label="Selesai" />
                </div>
                <AgentCompletionChart data={snapshot.weeklyCases} />
              </Panel>

              <Panel title="Ringkasan periode">
                <div className="space-y-3">
                  <MiniRow label="Total selesai" value={completedTotal} />
                  <MiniRow label="Total masuk" value={incomingTotal} />
                  <MiniRow label="Masih terbuka" value={openCases} />
                  <MiniRow
                    label="Hari paling produktif"
                    value={bestResolvedDay(snapshot.weeklyCases)}
                  />
                </div>
                <div className="mt-4 rounded-lg border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] p-3 text-xs leading-5 text-[var(--signal-blue)]">
                  Report detail tersedia di menu Reports untuk riwayat kasus,
                  kategori, dan tabel pekerjaan.
                </div>
              </Panel>
            </section>
          </div>
        </section>
      </div>
    </main>
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

function AgentCompletionChart({ data }: { data: WeeklyCasePoint[] }) {
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.newCases, item.resolvedCases]),
    1,
  );

  return (
    <div className="grid h-[260px] grid-cols-7 items-end gap-2">
      {data.map((item) => (
        <div className="flex h-full flex-col justify-end gap-2" key={item.day}>
          <div className="flex flex-1 items-end justify-center gap-1 rounded-lg bg-[var(--background)] px-1.5 py-2">
            <div
              className="w-4 rounded-t-md bg-[var(--signal-blue)]"
              style={{
                height: `${Math.max((item.newCases / maxValue) * 100, 8)}%`,
              }}
            />
            <div
              className="w-4 rounded-t-md bg-[var(--signal-green)]"
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
      ))}
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

function bestResolvedDay(data: WeeklyCasePoint[]) {
  const best = data.reduce((current, item) =>
    item.resolvedCases > current.resolvedCases ? item : current,
  );

  return `${best.day} (${best.resolvedCases})`;
}
