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

  let position = 3;

  if (category) {
    const categoryHref = category.slug
      ? `${SITE_ORIGIN}${buildBlogCategoryPath(category.slug)}`
      : `${SITE_ORIGIN}${buildBlogPath()}`;

    items.push({
      "@type": "ListItem",
      position,
      name: category.name,
      item: categoryHref,
    });
    position += 1;
  }

  items.push({
    "@type": "ListItem",
    position,
    name: postTitle,
    item: `${SITE_ORIGIN}${buildPostPath(category?.slug, postSlug)}`,
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
