import { managerDashboardMockData } from "@/core/dashboard/service/manager-dashboard.mock";
import { ManagerAgentsReportPage } from "@/core/dashboard/ui/ManagerAgentsReportPage";

export default function ManagerAgentsPage() {
  return <ManagerAgentsReportPage data={managerDashboardMockData} />;
}
