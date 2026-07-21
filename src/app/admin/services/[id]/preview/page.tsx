import { notFound } from "next/navigation";

import { PreviewShell } from "@/components/admin/preview-shell";
import { ServicePublicView } from "@/components/services/service-public-view";
import { getPublishedTestimonialsByServiceId } from "@/lib/public/queries";
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

  const testimonials = await getPublishedTestimonialsByServiceId(service.id);

  return (
    <PreviewShell
      status={service.status}
      editHref={`/admin/services/${service.id}`}
    >
      <ServicePublicView
        service={service}
        testimonials={testimonials}
        mode="preview"
      />
    </PreviewShell>
  );
}
