import { ReferenceDetailPage } from "@/core/reference/ui/ReferenceDetailPage";

export default async function AgentReferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ReferenceDetailPage dashboardRole="agent" referenceId={id} />;
}
