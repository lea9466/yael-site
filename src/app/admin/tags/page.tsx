import { TagsListClient } from "@/components/tags/tags-list-client";
import { TagsPageError } from "@/components/tags/tags-page-error";
import { fetchTagsList } from "@/lib/tags/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listTagsQuerySchema } from "@/lib/validations/tag";

export const dynamic = "force-dynamic";

type TagsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function TagsPage({ searchParams }: TagsPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listTagsQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listTagsQuerySchema.parse({});

  const data = await fetchTagsList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <TagsPageError />
      </div>
    );
  }

  return (
    <TagsListClient
      key={`${data.query.q}-${data.query.type}-${data.query.sort}-${data.query.page}`}
      data={data}
    />
  );
}
