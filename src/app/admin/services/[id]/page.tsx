import { notFound } from "next/navigation";

import { ServiceForm } from "@/components/services/service-form";
import { serviceDetailToFormInput } from "@/lib/services/form";
import { fetchServiceById } from "@/lib/services/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type EditServicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditServicePage({ params }: EditServicePageProps) {
  await requireAdmin();

  const { id } = await params;
  const service = await fetchServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <ServiceForm
      key={`${service.id}-${service.updated_at}`}
      mode="edit"
      initialService={service}
      initialValues={serviceDetailToFormInput(service)}
    />
  );
}
