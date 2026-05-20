import {
  Clock3,
  Inbox,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type {
  ManagerMetric,
  ManagerMetricTone,
} from "../../model/manager-dashboard.types";

interface ManagerMetricCardProps {
  metric: ManagerMetric;
}

const ICONS = {
  clock: Clock3,
  inbox: Inbox,
  shield: ShieldCheck,
  sparkles: Sparkles,
  timer: TimerReset,
};

export function ManagerMetricCard({ metric }: ManagerMetricCardProps) {
  const Icon = ICONS[metric.icon];
  const TrendIcon = metric.trend === "negative" ? TrendingDown : TrendingUp;

  return (
    <article className="min-h-[152px] rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass(
            metric.tone,
          )}`}
        >
          <Icon aria-hidden="true" size={19} />
        </span>
        <span
          className={`flex items-center gap-1 text-[11px] ${trendClass(metric.trend)}`}
        >
          <TrendIcon aria-hidden="true" size={13} />
          {metric.delta}
        </span>
      </div>
      <p className="text-3xl font-semibold leading-none text-[var(--rail-ink)]">
        {metric.value}
      </p>
      <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">
        {metric.label}
      </p>
    </article>
  );
}

function toneClass(tone: ManagerMetricTone) {
  const classes: Record<ManagerMetricTone, string> = {
    danger: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
    primary: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
    purple: "bg-[#ede9fe] text-[#5b21b6]",
    success: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
    warning: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
  };

  return classes[tone];
}

function trendClass(trend: ManagerMetric["trend"]) {
  const classes: Record<ManagerMetric["trend"], string> = {
    negative: "text-[var(--signal-red)]",
    neutral: "text-[var(--text-muted)]",
    positive: "text-[var(--signal-green)]",
  };

  return classes[trend];
}
