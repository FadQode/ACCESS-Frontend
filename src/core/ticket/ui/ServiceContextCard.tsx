import { TrainFront } from "lucide-react";
import type { TicketServiceContext } from "../model/ticket.types";
import { InfoCard, InfoRow } from "./CustomerInfoCard";

interface ServiceContextCardProps {
  context: TicketServiceContext;
}

export function ServiceContextCard({ context }: ServiceContextCardProps) {
  return (
    <InfoCard
      icon={<TrainFront aria-hidden="true" size={15} />}
      title="Related service info"
    >
      <InfoRow label="Reported issue" value={context.reportedIssue} />
      <InfoRow label="Route" value={context.route} />
      <InfoRow label="Known disruption" value={context.knownDisruption} />
      <InfoRow label="Policy: delay >2h" value={context.refundPolicy} />
    </InfoCard>
  );
}
