import { ServicesListClient } from "@/components/services/services-list-client";
import { ServicesPageError } from "@/components/services/services-page-error";
import { fetchServicesList } from "@/lib/services/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listServicesQuerySchema } from "@/lib/validations/service";

export const dynamic = "force-dynamic";

type ServicesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    featured?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listServicesQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listServicesQuerySchema.parse({});

  const data = await fetchServicesList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <ServicesPageError />
      </div>
    );
  }

  return (
    <ServicesListClient
      key={`${data.query.q}-${data.query.status}-${data.query.featured}-${data.query.sort}-${data.query.page}`}
      data={data}
    />
  );
}
