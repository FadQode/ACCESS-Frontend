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
      title="Info layanan terkait"
    >
      <InfoRow label="Isu dilaporkan" value={context.reportedIssue} />
      <InfoRow label="Rute" value={context.route} />
      <InfoRow label="Gangguan diketahui" value={context.knownDisruption} />
      <InfoRow
        label="Kebijakan: terlambat >2 jam"
        value={context.refundPolicy}
      />
    </InfoCard>
  );
}
