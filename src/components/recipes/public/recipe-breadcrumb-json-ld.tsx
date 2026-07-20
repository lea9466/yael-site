import {
  buildRecipeCategoryPath,
  buildRecipePath,
  buildRecipesPath,
} from "@/lib/public/recipe-paths";
import { SITE_ORIGIN } from "@/lib/site/constants";
import type { RecipeCategorySummary } from "@/lib/recipes/types";

type RecipeBreadcrumbJsonLdProps = {
  recipeTitle: string;
  recipeSlug: string;
  category: RecipeCategorySummary | null;
};

export function RecipeBreadcrumbJsonLd({
  recipeTitle,
  recipeSlug,
  category,
}: RecipeBreadcrumbJsonLdProps) {
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

  let position = 3;

  if (category) {
    const categoryHref = category.slug
      ? `${SITE_ORIGIN}${buildRecipeCategoryPath(category.slug)}`
      : `${SITE_ORIGIN}${buildRecipesPath()}`;

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
    name: recipeTitle,
    item: `${SITE_ORIGIN}${buildRecipePath(category?.slug, recipeSlug)}`,
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
