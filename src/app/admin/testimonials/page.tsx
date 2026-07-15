import { TestimonialsListClient } from "@/components/testimonials/testimonials-list-client";
import { TestimonialsPageError } from "@/components/testimonials/testimonials-page-error";
import { fetchTestimonialsList } from "@/lib/testimonials/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listTestimonialsQuerySchema } from "@/lib/validations/testimonial";

export const dynamic = "force-dynamic";

type TestimonialsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function TestimonialsPage({
  searchParams,
}: TestimonialsPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listTestimonialsQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listTestimonialsQuerySchema.parse({});

  const data = await fetchTestimonialsList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <TestimonialsPageError />
      </div>
    );
  }

  return (
    <TestimonialsListClient
      key={`${data.query.q}-${data.query.status}-${data.query.sort}-${data.query.page}`}
      data={data}
    />
  );
}
