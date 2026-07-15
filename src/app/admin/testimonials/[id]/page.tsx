import { notFound } from "next/navigation";

import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import { testimonialToFormInput } from "@/lib/testimonials/form";
import {
  fetchAdminServiceOptions,
  fetchTestimonialById,
} from "@/lib/testimonials/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type EditTestimonialPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTestimonialPage({
  params,
}: EditTestimonialPageProps) {
  await requireAdmin();

  const { id } = await params;
  const [testimonial, serviceOptions] = await Promise.all([
    fetchTestimonialById(id),
    fetchAdminServiceOptions(),
  ]);

  if (!testimonial) {
    notFound();
  }

  return (
    <TestimonialForm
      key={testimonial.id}
      mode="edit"
      testimonial={testimonial}
      initialValues={testimonialToFormInput(testimonial)}
      serviceOptions={serviceOptions}
    />
  );
}
