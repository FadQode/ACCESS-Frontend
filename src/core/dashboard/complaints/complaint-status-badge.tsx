import type { ComplaintStatus } from "@/core/dashboard/model/types/complaint.types";

const STATUS_LABEL: Record<string, string> = {
  closed: "Ditutup",
  resolved: "Selesai",
  submitted: "Masuk",
  waiting_action: "Menunggu aksi",
};

export type ComplaintStatusBadgeProps = {
  status: ComplaintStatus;
};

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full bg-[var(--signal-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
