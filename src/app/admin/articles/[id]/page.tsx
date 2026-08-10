import { notFound } from "next/navigation";

import { ArticleForm } from "@/components/articles/article-form";
import { articleDetailToFormInput } from "@/lib/articles/form";
import { fetchArticleById } from "@/lib/articles/queries";
import { requireAdmin } from "@/lib/auth/session";
import { fetchArticleTags } from "@/lib/taxonomy/queries";

export const dynamic = "force-dynamic";

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  await requireAdmin();

  const { id } = await params;
  const [article, availableTags] = await Promise.all([
    fetchArticleById(id),
    fetchArticleTags(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <ArticleForm
      key={`${article.id}-${article.updated_at}`}
      mode="edit"
      initialArticle={article}
      initialValues={articleDetailToFormInput(article)}
      availableTags={availableTags}
    />
  );
}
