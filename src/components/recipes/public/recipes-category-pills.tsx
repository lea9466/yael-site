import Link from "next/link";

import {
  buildRecipeCategoryPath,
  buildRecipesPath,
} from "@/lib/public/recipe-paths";
import type { PublicRecipeCategory } from "@/lib/public/recipe-listing";
import { cn } from "@/lib/utils/cn";

type RecipesCategoryPillsProps = {
  categories: PublicRecipeCategory[];
  activeSlug?: string | null;
  className?: string;
};

export function RecipesCategoryPills({
  categories,
  activeSlug,
  className,
}: RecipesCategoryPillsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="קטגוריות מתכונים"
      className={cn("recipes-category-pills", className)}
    >
      <ul className="recipes-category-pills__list">
        <li>
          <Link
            href={buildRecipesPath()}
            className={cn(
              "recipes-category-pills__pill public-focus-ring",
              !activeSlug && "recipes-category-pills__pill--active"
            )}
            aria-current={!activeSlug ? "page" : undefined}
          >
            הכל
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = activeSlug === category.slug;

          return (
            <li key={category.id}>
              <Link
                href={buildRecipeCategoryPath(category.slug)}
                className={cn(
                  "recipes-category-pills__pill public-focus-ring",
                  isActive && "recipes-category-pills__pill--active"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
