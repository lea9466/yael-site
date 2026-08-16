import { buildBlogPath, buildPostPath } from "@/lib/public/blog-paths";
import { SITE_ORIGIN } from "@/lib/site/constants";

type ArticleBreadcrumbJsonLdProps = {
  postTitle: string;
  postSlug: string;
};

export function ArticleBreadcrumbJsonLd({
  postTitle,
  postSlug,
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
    {
      "@type": "ListItem",
      position: 3,
      name: postTitle,
      item: `${SITE_ORIGIN}${buildPostPath(postSlug)}`,
    },
  ];

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
