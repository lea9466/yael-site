import { ArticleForm } from "@/components/articles/article-form";
import { createEmptyArticleFormInput } from "@/lib/articles/form";
import { requireAdmin } from "@/lib/auth/session";
import {
  fetchArticleCategories,
  fetchArticleTags,
} from "@/lib/taxonomy/queries";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requireAdmin();

  const [categories, availableTags] = await Promise.all([
    fetchArticleCategories(),
    fetchArticleTags(),
  ]);

  return (
    <ArticleForm
      mode="create"
      initialValues={createEmptyArticleFormInput(categories[0]?.id)}
      categories={categories}
      availableTags={availableTags}
    />
  );
}
