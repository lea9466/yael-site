import { PostSaveToastListener } from "@/components/admin/post-save-toast-listener";
import { CategoriesListClient } from "@/components/categories/categories-list-client";
import { CategoriesPageError } from "@/components/categories/categories-page-error";
import { fetchCategoriesList } from "@/lib/categories/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listCategoriesQuerySchema } from "@/lib/validations/category";

export const dynamic = "force-dynamic";

type CategoriesPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listCategoriesQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listCategoriesQuerySchema.parse({});

  const data = await fetchCategoriesList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <CategoriesPageError />
      </div>
    );
  }

  return (
    <>
      <PostSaveToastListener />
      <CategoriesListClient
        key={`${data.query.q}-${data.query.type}-${data.query.sort}-${data.query.page}`}
        data={data}
      />
    </>
  );
}
