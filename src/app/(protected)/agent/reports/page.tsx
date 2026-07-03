import { agentPerformanceSnapshots } from "@/core/dashboard/service/agent-performance.mock";
import { AgentReportPage } from "@/core/dashboard/ui/AgentReportPage";

export default function AgentReportsPage() {
  return <AgentReportPage snapshots={agentPerformanceSnapshots} />;
}
