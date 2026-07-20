import Link from "next/link";

import {
  buildRecipeCategoryPath,
  buildRecipesPath,
} from "@/lib/public/recipe-paths";
import type { PublicRecipeCategory } from "@/lib/public/recipe-listing";
import { SITE_ORIGIN } from "@/lib/site/constants";
import { cn } from "@/lib/utils/cn";

type RecipesListingBreadcrumbsProps = {
  category?: PublicRecipeCategory | null;
  className?: string;
};

export function RecipesListingBreadcrumbs({
  category,
  className,
}: RecipesListingBreadcrumbsProps) {
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
                href={buildRecipesPath()}
                className="recipes-listing-breadcrumbs__link public-focus-ring"
              >
                מתכונים
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
              מתכונים
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

type RecipesListingBreadcrumbJsonLdProps = {
  category?: PublicRecipeCategory | null;
};

export function RecipesListingBreadcrumbJsonLd({
  category,
}: RecipesListingBreadcrumbJsonLdProps) {
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
      name: "מתכונים",
      item: `${SITE_ORIGIN}${buildRecipesPath()}`,
    },
  ];

  if (category) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: category.name,
      item: `${SITE_ORIGIN}${buildRecipeCategoryPath(category.slug)}`,
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
