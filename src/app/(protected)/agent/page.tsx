import { agentPerformanceSnapshots } from "@/core/dashboard/service/agent-performance.mock";
import { AgentDashboard } from "@/core/dashboard/ui/AgentDashboard";

export default function AgentPage() {
  return <AgentDashboard snapshots={agentPerformanceSnapshots} />;
}
