import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import { createEmptyTestimonialFormInput } from "@/lib/testimonials/form";
import { fetchAdminServiceOptions } from "@/lib/testimonials/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type NewTestimonialPageProps = {
  searchParams: Promise<{ service_id?: string }>;
};

function parseServiceId(value?: string): string | null {
  if (!value) {
    return null;
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidPattern.test(value) ? value : null;
}

export default async function NewTestimonialPage({
  searchParams,
}: NewTestimonialPageProps) {
  await requireAdmin();

  const { service_id: rawServiceId } = await searchParams;
  const serviceId = parseServiceId(rawServiceId);
  const serviceOptions = await fetchAdminServiceOptions();

  return (
    <TestimonialForm
      mode="create"
      initialValues={createEmptyTestimonialFormInput(serviceId)}
      serviceOptions={serviceOptions}
    />
  );
}
