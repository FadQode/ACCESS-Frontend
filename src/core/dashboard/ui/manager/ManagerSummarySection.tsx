import type { ManagerMetric } from "../../model/manager-dashboard.types";
import { ManagerMetricCard } from "./ManagerMetricCard";

interface ManagerSummarySectionProps {
  metrics: ManagerMetric[];
}

export function ManagerSummarySection({ metrics }: ManagerSummarySectionProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {metrics.map((metric) => (
        <ManagerMetricCard key={metric.id} metric={metric} />
      ))}
    </section>
  );
}
