import {
  buildBlogCategoryPath,
  buildBlogPath,
  buildPostPath,
} from "@/lib/public/blog-paths";
import { SITE_ORIGIN } from "@/lib/site/constants";
import type { ArticleCategorySummary } from "@/lib/articles/types";

type ArticleBreadcrumbJsonLdProps = {
  postTitle: string;
  postSlug: string;
  category: ArticleCategorySummary | null;
};

export function ArticleBreadcrumbJsonLd({
  postTitle,
  postSlug,
  category,
}: ArticleBreadcrumbJsonLdProps) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "בית",
      item: SITE_ORIGIN,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "בלוג",
      item: `${SITE_ORIGIN}${buildBlogPath()}`,
    },
  ];

  if (category) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: category.name,
      item: `${SITE_ORIGIN}${buildBlogCategoryPath(category.slug)}`,
    });
  }

  items.push({
    "@type": "ListItem",
    position: category ? 4 : 3,
    name: postTitle,
    item: `${SITE_ORIGIN}${buildPostPath(category?.slug ?? null, postSlug)}`,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
