import type { AgentPerformanceSummary } from "../../model/manager-dashboard.types";
import { AgentPerformanceRow } from "./AgentPerformanceRow";

interface AgentPerformanceTableProps {
  agents: AgentPerformanceSummary[];
}

export function AgentPerformanceTable({ agents }: AgentPerformanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-[var(--rail-border)] bg-[var(--background)] text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <th className="px-4 py-3">Agen</th>
            <th className="px-4 py-3">Selesai</th>
            <th className="px-4 py-3">Rata-rata respons</th>
            <th className="px-4 py-3">Eskalasi</th>
            <th className="px-4 py-3">Kualitas</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <AgentPerformanceRow agent={agent} key={agent.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
