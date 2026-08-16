import { ArticlesListClient } from "@/components/articles/articles-list-client";
import { ArticlesPageError } from "@/components/articles/articles-page-error";
import { fetchArticlesList } from "@/lib/articles/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listArticlesQuerySchema } from "@/lib/validations/article";

export const dynamic = "force-dynamic";

type ArticlesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    featured?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listArticlesQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listArticlesQuerySchema.parse({});

  const data = await fetchArticlesList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <ArticlesPageError />
      </div>
    );
  }

  return (
    <ArticlesListClient
      key={`${data.query.q}-${data.query.status}-${data.query.featured}-${data.query.tag}-${data.query.sort}-${data.query.page}`}
      data={data}
    />
  );
}
