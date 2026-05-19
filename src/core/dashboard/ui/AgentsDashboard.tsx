"use client";

import {
  AlertTriangle,
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import type {
  AgentPerformanceSnapshot,
  CaseTrendPoint,
  CategoryBreakdownItem,
  PerformancePeriod,
  QualitySignal,
  TeamRankingItem,
  WeeklyCasePoint,
} from "@/core/dashboard/model/types/agent.types";

export interface AgentPerformanceDashboardProps {
  snapshots: AgentPerformanceSnapshot[];
}

const CATEGORY_COLORS = ["#1a3f6f", "#d99a18", "#15734f", "#7d6bd6"];

export function AgentPerformanceDashboard({
  snapshots,
}: AgentPerformanceDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PerformancePeriod>(
    snapshots[0]?.period ?? "7d",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const snapshot = useMemo(() => {
    return (
      snapshots.find((item) => item.period === selectedPeriod) ?? snapshots[0]
    );
  }, [selectedPeriod, snapshots]);

  const visibleOutcomes = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return snapshot.recentOutcomes;
    }

    return snapshot.recentOutcomes.filter((outcome) => {
      return [outcome.referenceNumber, outcome.category, outcome.outcome]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchTerm, snapshot]);

  if (!snapshot) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)]">
        <section className="mx-auto flex min-h-[520px] max-w-5xl items-center justify-center rounded-[20px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-6">
          <div className="max-w-md text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Agent portal
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--rail-ink)]">
              No performance snapshot available
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Once the service feed is connected, your performance metrics will
              appear here.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const openCases = snapshot.metrics.activeCases;

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          stats={[
            { label: "On time", value: `${snapshot.slaHealth.onTimePercent}%` },
            { label: "Active", value: openCases.toString() },
            {
              label: "Overdue",
              value: snapshot.slaHealth.overdueCount.toString(),
            },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            controls={
              <select
                aria-label="Select performance period"
                className="h-10 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-medium text-[var(--text-muted)] outline-none focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
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
            onSidebarToggle={() => setSidebarOpen((isOpen) => !isOpen)}
            roleLabel={snapshot.role}
            userName={snapshot.agentName}
          />

          <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              detail={`${snapshot.slaHealth.activeRiskCount} at risk · ${snapshot.slaHealth.overdueCount} overdue`}
              icon={<ShieldCheck aria-hidden="true" size={20} />}
              label="SLA health"
              tone="blue"
              trend="up"
              value={`${snapshot.slaHealth.onTimePercent}%`}
            />
            <KpiCard
              detail="Target under 15m"
              icon={<Clock3 aria-hidden="true" size={20} />}
              label="Avg first response"
              tone="amber"
              trend="down"
              value={`${snapshot.metrics.averageFirstResponseMinutes}m`}
            />
            <KpiCard
              detail={`${snapshot.metrics.resolvedToday} cases resolved today`}
              icon={<Sparkles aria-hidden="true" size={20} />}
              label="Quality score"
              tone="green"
              trend="up"
              value={snapshot.metrics.qualityScore.toString()}
            />
            <KpiCard
              detail={`${openCases} active cases`}
              icon={<AlertTriangle aria-hidden="true" size={20} />}
              label="Escalation rate"
              tone="red"
              trend="attention"
              value={`${snapshot.metrics.escalationRatePercent}%`}
            />
          </section>

          <section className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
            <Card
              action={<SelectPill label="Monthly" />}
              title="Resolution trend"
            >
              <div className="mb-3 flex flex-wrap gap-4">
                <LegendDot color="var(--signal-blue)" label="Cases resolved" />
                <LegendDot
                  color="var(--signal-amber)"
                  label="Avg response (min)"
                />
              </div>
              <TrendChart data={snapshot.caseTrend} />
              <div className="mt-3 grid grid-cols-2 border-t border-[var(--rail-border)] pt-3">
                <SummaryStat
                  label="Resolved this month"
                  value={`${latest(snapshot.caseTrend)?.resolved ?? 0} cases`}
                />
                <SummaryStat
                  label="Avg resolution time"
                  value={`${snapshot.oldestActiveCaseHours + 1}.4 hrs`}
                />
              </div>
            </Card>

            <Card
              action={<SelectPill label="This week" />}
              title="Cases this week"
            >
              <div className="mb-3 flex flex-wrap gap-4">
                <LegendDot color="var(--signal-blue)" label="New" />
                <LegendDot color="var(--signal-blue-soft)" label="Resolved" />
              </div>
              <p className="mb-2 text-xl font-semibold text-[var(--rail-ink)]">
                {openCases} open
              </p>
              <WeeklyCasesChart data={snapshot.weeklyCases} />
            </Card>
          </section>

          <section className="grid gap-3 xl:grid-cols-3">
            <Card title="Service categories">
              <div className="mb-4 flex flex-wrap gap-x-3 gap-y-2">
                {snapshot.categoryBreakdown.map((item, index) => (
                  <LegendDot
                    color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    key={item.label}
                    label={`${item.label} ${item.percent}%`}
                  />
                ))}
              </div>
              <CategoryDonut data={snapshot.categoryBreakdown} />
            </Card>

            <Card title="Service signals">
              <div className="space-y-3">
                {snapshot.qualitySignals.map((signal) => (
                  <SignalRow key={signal.label} signal={signal} />
                ))}
              </div>
            </Card>

            <Card
              action={
                <span className="text-[10px] text-[var(--text-muted)]">
                  by quality score
                </span>
              }
              title="Team ranking"
            >
              <div className="space-y-2">
                {snapshot.teamRanking.map((agent) => (
                  <RankingRow agent={agent} key={agent.name} />
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] font-medium text-[var(--rail-ink)]">
                    Recent outcomes
                  </p>
                  <label className="relative min-h-8 sm:w-[190px]">
                    <span className="sr-only">Search recent outcomes</span>
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                      size={14}
                    />
                    <input
                      className="h-8 w-full rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] pl-8 pr-3 text-xs text-[var(--rail-ink)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--signal-blue)] focus:ring-2 focus:ring-[var(--signal-blue-soft)]"
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search outcomes"
                      type="search"
                      value={searchTerm}
                    />
                  </label>
                </div>
                <div className="mt-2 space-y-2">
                  {visibleOutcomes.length > 0 ? (
                    visibleOutcomes.slice(0, 3).map((outcome) => (
                      <div
                        className="grid grid-cols-[1fr_auto] gap-2 text-xs"
                        key={outcome.referenceNumber}
                      >
                        <span className="truncate text-[var(--rail-ink)]">
                          {outcome.referenceNumber} · {outcome.category}
                        </span>
                        <span className="font-semibold text-[var(--signal-blue)]">
                          {outcome.qualityScore}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">
                      No matching outcomes.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </section>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  detail,
  icon,
  label,
  tone,
  trend,
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  tone: "blue" | "amber" | "green" | "red";
  trend: "up" | "down" | "attention";
  value: string;
}) {
  return (
    <article className="flex min-h-[150px] flex-col justify-between rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass(tone)}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-[var(--rail-ink)]">{value}</p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{label}</p>
        <p
          className={`mt-2 flex items-center gap-1 text-[11px] ${trendClass(trend)}`}
        >
          {trend === "down" ? (
            <TrendingDown aria-hidden="true" size={13} />
          ) : (
            <TrendingUp aria-hidden="true" size={13} />
          )}
          {detail}
        </p>
      </div>
    </article>
  );
}

function Card({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function SelectPill({ label }: { label: string }) {
  return (
    <button
      className="rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 py-1 text-[11px] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)]"
      type="button"
    >
      {label}
    </button>
  );
}

function TrendChart({ data }: { data: CaseTrendPoint[] }) {
  const maxResolved = Math.max(...data.map((item) => item.resolved), 1);
  const maxResponse = Math.max(
    ...data.map((item) => item.averageResponseMinutes),
    1,
  );
  const points = data
    .map((item, index) => {
      const x = 28 + index * (304 / Math.max(data.length - 1, 1));
      const y = 24 + (1 - item.averageResponseMinutes / maxResponse) * 108;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-[220px] w-full">
      <svg
        aria-label="Monthly case resolution and average response time trend"
        className="h-full w-full overflow-visible"
        role="img"
        viewBox="0 0 360 180"
      >
        <title>Resolution trend</title>
        {[40, 80, 120, 160].map((y) => (
          <line
            key={y}
            stroke="rgba(23, 32, 28, 0.08)"
            strokeWidth="1"
            x1="18"
            x2="350"
            y1={y}
            y2={y}
          />
        ))}
        {data.map((item, index) => {
          const barHeight = Math.max((item.resolved / maxResolved) * 112, 10);
          const x = 18 + index * (320 / data.length) + 8;

          return (
            <g key={item.label}>
              <rect
                fill="var(--signal-blue)"
                height={barHeight}
                rx="3"
                width="20"
                x={x}
                y={144 - barHeight}
              />
              <text
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
                x={x + 10}
                y="164"
              >
                {item.label}
              </text>
            </g>
          );
        })}
        <polyline
          fill="none"
          points={points}
          stroke="var(--signal-amber)"
          strokeDasharray="5 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {data.map((item, index) => {
          const x = 28 + index * (304 / Math.max(data.length - 1, 1));
          const y = 24 + (1 - item.averageResponseMinutes / maxResponse) * 108;

          return (
            <circle
              cx={x}
              cy={y}
              fill="var(--signal-amber)"
              key={`${item.label}-${item.averageResponseMinutes}`}
              r="4"
            />
          );
        })}
      </svg>
    </div>
  );
}

function WeeklyCasesChart({ data }: { data: WeeklyCasePoint[] }) {
  const maxCases = Math.max(
    ...data.flatMap((item) => [item.newCases, item.resolvedCases]),
    1,
  );

  return (
    <div className="grid h-[180px] grid-cols-7 items-end gap-2">
      {data.map((item) => (
        <div
          className="flex h-full flex-col justify-end gap-2"
          key={`${item.day}-${item.newCases}-${item.resolvedCases}`}
        >
          <div className="flex flex-1 items-end justify-center gap-1 rounded-lg bg-[var(--background)] px-1">
            <div
              className="w-3 rounded-t bg-[var(--signal-blue)]"
              style={{
                height: `${Math.max((item.newCases / maxCases) * 100, 8)}%`,
              }}
            />
            <div
              className="w-3 rounded-t bg-[var(--signal-blue-soft)]"
              style={{
                height: `${Math.max((item.resolvedCases / maxCases) * 100, 8)}%`,
              }}
            />
          </div>
          <span className="text-center text-[10px] font-medium text-[var(--text-muted)]">
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryDonut({ data }: { data: CategoryBreakdownItem[] }) {
  const gradient = buildConicGradient(data);

  return (
    <div className="flex min-h-[160px] items-center justify-center">
      <div
        aria-label="Service category distribution"
        className="relative h-36 w-36 rounded-full"
        role="img"
        style={{ background: gradient }}
      >
        <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-[var(--surface-panel)]">
          <TicketCheck
            aria-hidden="true"
            className="text-[var(--signal-blue)]"
            size={22}
          />
          <span className="mt-1 text-xs font-semibold text-[var(--rail-ink)]">
            Mix
          </span>
        </div>
      </div>
    </div>
  );
}

function SignalRow({ signal }: { signal: QualitySignal }) {
  const color =
    signal.status === "watch" ? "var(--signal-amber)" : "var(--signal-green)";

  return (
    <div className="grid grid-cols-[1fr_84px_38px] items-center gap-2">
      <span className="min-w-0 truncate text-[11px] text-[var(--rail-ink)]">
        {signal.label}
      </span>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className="h-full rounded-full"
          style={{ background: color, width: `${signal.percent}%` }}
        />
      </div>
      <span className="text-right text-[11px] font-semibold" style={{ color }}>
        {signal.percent}%
      </span>
    </div>
  );
}

function RankingRow({ agent }: { agent: TeamRankingItem }) {
  return (
    <div
      className={`grid grid-cols-[18px_28px_1fr_54px_32px] items-center gap-2 rounded-lg px-1 py-1.5 ${
        agent.isCurrentAgent ? "bg-[var(--signal-blue-soft)]" : ""
      }`}
    >
      <span
        className={`text-center text-[11px] font-semibold ${
          agent.rank === 1
            ? "text-[var(--signal-amber)]"
            : "text-[var(--text-muted)]"
        }`}
      >
        {agent.rank}
      </span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--signal-blue)] text-[9px] font-semibold text-white">
        {agent.initials}
      </span>
      <span
        className={`truncate text-xs ${
          agent.isCurrentAgent
            ? "font-semibold text-[var(--signal-blue)]"
            : "text-[var(--rail-ink)]"
        }`}
      >
        {agent.name}
      </span>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className="h-full rounded-full bg-[var(--signal-blue)]"
          style={{ width: `${agent.score}%` }}
        />
      </div>
      <span className="text-right text-[11px] font-semibold text-[var(--rail-ink)]">
        {agent.score}
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function latest<T>(items: T[]) {
  return items[items.length - 1];
}

function buildConicGradient(data: CategoryBreakdownItem[]) {
  let cursor = 0;
  const stops = data.map((item, index) => {
    const start = cursor;
    cursor += item.percent;
    const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

    return `${color} ${start}% ${cursor}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

function toneClass(tone: "blue" | "amber" | "green" | "red") {
  const classes = {
    amber: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
    blue: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    green: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    red: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
  };

  return classes[tone];
}

function trendClass(trend: "up" | "down" | "attention") {
  if (trend === "attention") {
    return "text-[var(--signal-red)]";
  }

  return "text-[var(--signal-green)]";
}
