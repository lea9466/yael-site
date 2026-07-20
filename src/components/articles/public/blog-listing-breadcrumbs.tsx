import Link from "next/link";

import {
  buildBlogCategoryPath,
  buildBlogPath,
} from "@/lib/public/blog-paths";
import type { PublicBlogCategory } from "@/lib/public/blog-listing";
import { SITE_ORIGIN } from "@/lib/site/constants";
import { cn } from "@/lib/utils/cn";

type BlogListingBreadcrumbsProps = {
  category?: PublicBlogCategory | null;
  className?: string;
};

export function BlogListingBreadcrumbs({
  category,
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
        {category ? (
          <>
            <li className="recipes-listing-breadcrumbs__item">
              <Link
                href={buildBlogPath()}
                className="recipes-listing-breadcrumbs__link public-focus-ring"
              >
                בלוג
              </Link>
            </li>
            <li
              aria-hidden="true"
              className="recipes-listing-breadcrumbs__separator"
            >
              /
            </li>
            <li className="recipes-listing-breadcrumbs__item">
              <span
                aria-current="page"
                className="recipes-listing-breadcrumbs__current"
              >
                {category.name}
              </span>
            </li>
          </>
        ) : (
          <li className="recipes-listing-breadcrumbs__item">
            <span
              aria-current="page"
              className="recipes-listing-breadcrumbs__current"
            >
              בלוג
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

type BlogListingBreadcrumbJsonLdProps = {
  category?: PublicBlogCategory | null;
};

export function BlogListingBreadcrumbJsonLd({
  category,
}: BlogListingBreadcrumbJsonLdProps) {
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
