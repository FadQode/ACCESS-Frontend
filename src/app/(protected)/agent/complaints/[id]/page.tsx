import { ComplaintDetail } from "@/core/dashboard/complaints/complaint-detail";

export default async function AgentComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ComplaintDetail complaintId={id} />;
}
