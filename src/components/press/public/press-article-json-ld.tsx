import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site/constants";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import type { PressArticlePublicDetail } from "@/lib/press/types";

type PressArticleJsonLdProps = {
  article: PressArticlePublicDetail;
  authorName?: string;
};

export function PressArticleJsonLd({
  article,
  authorName = "יעל קנייבסקי",
}: PressArticleJsonLdProps) {
  const url = `${SITE_ORIGIN}/press/${article.slug}`;
  const description = article.seo_description
    ? normalizeMultilineTextForSeo(article.seo_description)
    : article.excerpt
      ? normalizeMultilineTextForSeo(article.excerpt)
      : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    url,
    dateModified: article.updated_at,
    datePublished: article.published_at,
    inLanguage: "he",
    author: {
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/#person`,
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: article.publication_name,
    },
    isPartOf: {
      "@type": "Periodical",
      name: article.publication_name,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (description) {
    jsonLd.description = description;
  }

  return <JsonLd data={jsonLd} />;
}
