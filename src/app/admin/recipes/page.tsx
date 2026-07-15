import { RecipesListClient } from "@/components/recipes/recipes-list-client";
import { RecipesPageError } from "@/components/recipes/recipes-page-error";
import { fetchRecipesList } from "@/lib/recipes/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listRecipesQuerySchema } from "@/lib/validations/recipe";

export const dynamic = "force-dynamic";

type RecipesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    featured?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listRecipesQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listRecipesQuerySchema.parse({});

  const data = await fetchRecipesList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <RecipesPageError />
      </div>
    );
  }

  return (
    <RecipesListClient
      key={`${data.query.q}-${data.query.status}-${data.query.featured}-${data.query.category}-${data.query.tag}-${data.query.sort}-${data.query.page}`}
      data={data}
    />
  );
}
