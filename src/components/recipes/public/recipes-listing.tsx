import Link from "next/link";
import { ChefHat } from "lucide-react";

import { RecipeCard } from "@/components/homepage/recipe-card";
import { PublicEmptyState } from "@/components/public/states/public-empty-state";
import { RecipesCategoryPills } from "@/components/recipes/public/recipes-category-pills";
import {
  RecipesListingBreadcrumbJsonLd,
  RecipesListingBreadcrumbs,
} from "@/components/recipes/public/recipes-listing-breadcrumbs";
import { RecipesListingFilters } from "@/components/recipes/public/recipes-listing-filters";
import { RecipesListingHero } from "@/components/recipes/public/recipes-listing-hero";
import { RecipesListingPagination } from "@/components/recipes/public/recipes-listing-pagination";
import {
  buildRecipeCategoryPath,
  buildRecipesPath,
} from "@/lib/public/recipe-paths";
import type { PublicRecipeListingResult } from "@/lib/public/recipe-listing";
import { cn } from "@/lib/utils/cn";

type RecipesListingProps = {
  data: PublicRecipeListingResult;
};

export function RecipesListing({ data }: RecipesListingProps) {
  const {
    category,
    recipes,
    categories,
    tags,
    query,
    heroCount,
    totalPages,
  } = data;
  const basePath = category
    ? buildRecipeCategoryPath(category.slug)
    : buildRecipesPath();
  const showCategoryPills = !category;
  const hasActiveFilters =
    query.q.length > 0 ||
    (query.tag !== "all" && query.tag.length > 0) ||
    query.difficulty !== "all";

  return (
    <>
      <RecipesListingBreadcrumbJsonLd category={category} />

      <section
        aria-labelledby="recipes-page-title"
        className="recipes-section recipes-page recipes-listing"
      >
        <div className="recipes-section__inner recipes-listing__inner">
          <RecipesListingBreadcrumbs category={category} />

          <RecipesListingHero category={category} totalCount={heroCount} />

          {showCategoryPills ? (
            <RecipesCategoryPills categories={categories} />
          ) : null}

          <RecipesListingFilters
            basePath={basePath}
            query={query}
            tags={tags}
          />

          {recipes.length > 0 ? (
            <>
              <ul
                className={cn(
                  "recipes-section__grid",
                  `recipes-section__grid--count-${Math.min(recipes.length, 3)}`
                )}
              >
                {recipes.map((recipe) => (
                  <li key={recipe.id} className="recipes-section__item">
                    <RecipeCard recipe={recipe} />
                  </li>
                ))}
              </ul>

              <RecipesListingPagination
                basePath={basePath}
                query={query}
                page={query.page}
                totalPages={totalPages}
              />
            </>
          ) : (
            <PublicEmptyState
              icon={ChefHat}
              title={
                hasActiveFilters
                  ? "לא נמצאו מתכונים"
                  : category
                    ? "עדיין אין מתכונים בקטגוריה הזו"
                    : "עדיין אין מתכונים לפרסום"
              }
              description={
                hasActiveFilters
                  ? "נסי לשנות את החיפוש או את הסינון."
                  : category
                    ? "נשמח לעדכן אותה בקרוב."
                    : "בקרוב יתווספו כאן מתכונים חדשים."
              }
              action={
                hasActiveFilters ? (
                  <Link
                    href={basePath}
                    className="recipes-listing__empty-action public-focus-ring"
                  >
                    איפוס סינון
                  </Link>
                ) : category ? (
                  <Link
                    href={buildRecipesPath()}
                    className="recipes-listing__empty-action public-focus-ring"
                  >
                    לכל המתכונים
                  </Link>
                ) : undefined
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
