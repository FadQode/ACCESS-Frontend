import { ReferenceDetailPage } from "@/core/reference/ui/ReferenceDetailPage";

export default async function ManagerReferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ReferenceDetailPage dashboardRole="manager" referenceId={id} />;
}
