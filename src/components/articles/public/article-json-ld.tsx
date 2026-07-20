import { buildArticleCanonicalUrl } from "@/lib/seo/resolve";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import { sanitizePlainText } from "@/lib/services/sanitize";
import type { ArticleDetail } from "@/lib/articles/types";

type ArticleJsonLdProps = {
  article: ArticleDetail;
};

export function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const description = normalizeMultilineTextForSeo(
    sanitizePlainText(
      article.seo.description.trim() || article.body
    )
  );

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    url: buildArticleCanonicalUrl(article.slug, article.category?.slug),
    dateModified: article.updated_at,
  };

  if (description) {
    jsonLd.description = description;
  }

  if (article.coverUrl) {
    jsonLd.image = [article.coverUrl];
  }

  if (article.published_at) {
    jsonLd.datePublished = article.published_at;
  }

  if (article.category?.name) {
    jsonLd.articleSection = article.category.name;
  }

  if (article.tags.length > 0) {
    jsonLd.keywords = article.tags.map((tag) => tag.name).join(", ");
  }

  if (article.reading_time_minutes > 0) {
    jsonLd.timeRequired = `PT${article.reading_time_minutes}M`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
