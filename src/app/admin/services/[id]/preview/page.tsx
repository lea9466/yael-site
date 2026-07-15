import { notFound } from "next/navigation";

import { ServicePreviewBanner } from "@/components/services/service-preview-banner";
import { ServicePublicView } from "@/components/services/service-public-view";
import { fetchServiceById } from "@/lib/services/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ServicePreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServicePreviewPage({
  params,
}: ServicePreviewPageProps) {
  await requireAdmin();

  const { id } = await params;
  const service = await fetchServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-1 sm:px-0">
      <ServicePreviewBanner serviceId={service.id} status={service.status} />
      <ServicePublicView service={service} />
    </div>
  );
}
