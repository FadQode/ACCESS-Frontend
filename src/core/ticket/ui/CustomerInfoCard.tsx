import { User } from "lucide-react";
import type { TicketCustomerInfo } from "../model/ticket.types";

interface CustomerInfoCardProps {
  customer: TicketCustomerInfo;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  return (
    <InfoCard
      icon={<User aria-hidden="true" size={15} />}
      title={customer.name}
    >
      <InfoRow label="Kontak" value={customer.contact} />
      <InfoRow label="Kanal" value={customer.channel} />
      <InfoRow label="Keluhan sebelumnya" value={customer.pastComplaints} />
      <InfoRow label="Kontak terakhir" value={customer.lastContact} />
    </InfoCard>
  );
}

export function InfoCard({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--rail-border)] bg-[var(--background)] px-2.5 py-2 text-[var(--text-muted)]">
        {icon}
        <h3 className="text-[11px] font-semibold text-[var(--rail-ink)]">
          {title}
        </h3>
      </div>
      <div className="space-y-1.5 p-2.5">{children}</div>
    </article>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="text-right text-[11px] font-semibold leading-5 text-[var(--rail-ink)]">
        {value}
      </span>
    </div>
  );
}
