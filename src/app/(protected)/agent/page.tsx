import { AgentPerformanceDashboard } from "@/core/dashboard/agent/agent-performance-dashboard";
import { agentPerformanceSnapshots } from "@/core/dashboard/service/agent-performance.mock";

export default function AgentPage() {
  return <AgentPerformanceDashboard snapshots={agentPerformanceSnapshots} />;
}
