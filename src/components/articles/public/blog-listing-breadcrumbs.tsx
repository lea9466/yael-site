import Link from "next/link";

import { SITE_ORIGIN } from "@/lib/site/constants";
import { cn } from "@/lib/utils/cn";

type BlogListingBreadcrumbsProps = {
  className?: string;
};

export function BlogListingBreadcrumbs({
  className,
}: BlogListingBreadcrumbsProps) {
  return (
    <nav
      aria-label="ניווט פירורי לחם"
      className={cn("recipes-listing-breadcrumbs", className)}
    >
      <ol className="recipes-listing-breadcrumbs__list">
        <li className="recipes-listing-breadcrumbs__item">
          <Link href="/" className="recipes-listing-breadcrumbs__link public-focus-ring">
            בית
          </Link>
        </li>
        <li aria-hidden="true" className="recipes-listing-breadcrumbs__separator">
          /
        </li>
        <li className="recipes-listing-breadcrumbs__item">
          <span
            aria-current="page"
            className="recipes-listing-breadcrumbs__current"
          >
            תוכן טוב
          </span>
        </li>
      </ol>
    </nav>
  );
}

export function BlogListingBreadcrumbJsonLd() {
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
      name: "תוכן טוב",
      item: `${SITE_ORIGIN}/blog`,
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
