import { agentPerformanceSnapshots } from "@/core/dashboard/service/agent-performance.mock";
import { AgentPerformanceDashboard } from "@/core/dashboard/ui/AgentsDashboard";

export default function AgentPage() {
  return <AgentPerformanceDashboard snapshots={agentPerformanceSnapshots} />;
}
