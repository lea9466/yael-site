import type { ArticleDetail } from "@/lib/articles/types";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildArticleCanonicalUrl } from "@/lib/seo/resolve";
import { SITE_ORIGIN } from "@/lib/site/constants";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import { sanitizePlainText } from "@/lib/services/sanitize";

type ArticleJsonLdProps = {
  article: ArticleDetail;
  authorName?: string;
};

export function ArticleJsonLd({
  article,
  authorName = "יעל קנייבסקי",
}: ArticleJsonLdProps) {
  const description = normalizeMultilineTextForSeo(
    sanitizePlainText(article.seo.description.trim() || article.body)
  );

  const author = {
    "@type": "Person",
    "@id": `${SITE_ORIGIN}/#person`,
    name: authorName,
  };

  const publisher = {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: authorName,
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    url: buildArticleCanonicalUrl(article.slug),
    dateModified: article.updated_at,
    author,
    publisher,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": buildArticleCanonicalUrl(article.slug),
    },
    inLanguage: "he",
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

  if (article.tags.length > 0) {
    jsonLd.keywords = article.tags.map((tag) => tag.name).join(", ");
  }

  if (article.reading_time_minutes > 0) {
    jsonLd.timeRequired = `PT${article.reading_time_minutes}M`;
  }

  return <JsonLd data={jsonLd} />;
}
