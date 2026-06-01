import type { AgentPerformanceSummary } from "../../model/manager-dashboard.types";
import { AgentPerformanceTable } from "./AgentPerformanceTable";

interface AgentPerformanceCardProps {
  agents: AgentPerformanceSummary[];
}

export function AgentPerformanceCard({ agents }: AgentPerformanceCardProps) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--rail-border)] p-4">
        <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
          Agent performance
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Tiket selesai, kecepatan respons, beban eskalasi, dan kualitas.
        </p>
      </div>
      <AgentPerformanceTable agents={agents} />
    </section>
  );
}
