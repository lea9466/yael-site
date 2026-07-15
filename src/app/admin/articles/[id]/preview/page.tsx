import { notFound } from "next/navigation";

import { PreviewShell } from "@/components/admin/preview-shell";
import { ArticlePublicView } from "@/components/articles/article-public-view";
import { fetchArticleById } from "@/lib/articles/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ArticlePreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArticlePreviewPage({
  params,
}: ArticlePreviewPageProps) {
  await requireAdmin();

  const { id } = await params;
  const article = await fetchArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <PreviewShell
      status={article.status}
      editHref={`/admin/articles/${article.id}`}
    >
      <ArticlePublicView article={article} mode="preview" />
    </PreviewShell>
  );
}
