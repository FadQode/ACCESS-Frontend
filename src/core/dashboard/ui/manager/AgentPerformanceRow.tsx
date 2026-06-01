import type { AgentPerformanceSummary } from "../../model/manager-dashboard.types";

interface AgentPerformanceRowProps {
  agent: AgentPerformanceSummary;
}

export function AgentPerformanceRow({ agent }: AgentPerformanceRowProps) {
  const isOnTarget = agent.status === "on-target";

  return (
    <tr className="border-b border-[var(--rail-border)] last:border-b-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--signal-blue)] text-[10px] font-semibold text-white">
            {agent.initials}
          </span>
          <span className="text-sm font-semibold text-[var(--rail-ink)]">
            {agent.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--rail-ink)]">
        {agent.resolvedCount}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
        {agent.averageResponseTime}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
        {agent.escalationCount}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--background)]">
            <div
              className={`h-full rounded-full ${
                isOnTarget
                  ? "bg-[var(--signal-green)]"
                  : "bg-[var(--signal-amber)]"
              }`}
              style={{ width: `${agent.qualityScore}%` }}
            />
          </div>
          <span className="w-7 text-right text-xs font-semibold text-[var(--rail-ink)]">
            {agent.qualityScore}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isOnTarget
              ? "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
              : "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]"
          }`}
        >
          {isOnTarget ? "Sesuai target" : "Perlu ditinjau"}
        </span>
      </td>
    </tr>
  );
}
