import { notFound, permanentRedirect } from "next/navigation";

import { getPublishedPostBySlug } from "@/lib/public/blog-detail";
import { buildBlogPath, buildPostPath } from "@/lib/public/blog-paths";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

type LegacyArticlePageProps = {
  params: Promise<{ slug: string }>;
};

/** Legacy flat `/articles/{slug}` → nested `/blog/{category}/{slug}`. */
export default async function LegacyArticleRedirectPage({
  params,
}: LegacyArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  const article = await getPublishedPostBySlug(slug);

  if (!article) {
    notFound();
  }

  if (article.category?.slug) {
    permanentRedirect(buildPostPath(article.category.slug, article.slug));
  }

  permanentRedirect(buildBlogPath());
}
