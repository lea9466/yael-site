import { PressListClient } from "@/components/press/press-list-client";
import { requireAdmin } from "@/lib/auth/session";
import { fetchPressArticlesList } from "@/lib/press/queries";
import { listPressArticlesQuerySchema } from "@/lib/validations/press-article";

export const dynamic = "force-dynamic";

type PressPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function AdminPressPage({ searchParams }: PressPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listPressArticlesQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listPressArticlesQuerySchema.parse({});

  const data = await fetchPressArticlesList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <p role="alert" className="text-[var(--color-error)]">
          לא ניתן לטעון את רשימת הכתבות כרגע.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PressListClient
        key={`${data.query.q}-${data.query.status}-${data.query.sort}-${data.query.page}`}
        data={data}
      />
    </div>
  );
}
