import { ArticleForm } from "@/components/articles/article-form";
import { createEmptyArticleFormInput } from "@/lib/articles/form";
import { requireAdmin } from "@/lib/auth/session";
import { fetchArticleTags } from "@/lib/taxonomy/queries";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requireAdmin();

  const availableTags = await fetchArticleTags();

  return (
    <ArticleForm
      mode="create"
      initialValues={createEmptyArticleFormInput()}
      availableTags={availableTags}
    />
  );
}
