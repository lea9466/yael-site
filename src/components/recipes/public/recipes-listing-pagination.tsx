import Link from "next/link";

import { buildRecipeListingHref } from "@/lib/public/recipe-paths";
import type { PublicRecipeListingQuery } from "@/lib/validations/public-recipe-listing";
import { cn } from "@/lib/utils/cn";

type RecipesListingPaginationProps = {
  basePath: string;
  query: PublicRecipeListingQuery;
  page: number;
  totalPages: number;
  className?: string;
};

export function RecipesListingPagination({
  basePath,
  query,
  page,
  totalPages,
  className,
}: RecipesListingPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousHref =
    page > 1
      ? buildRecipeListingHref(basePath, { ...query, page: page - 1 })
      : null;
  const nextHref =
    page < totalPages
      ? buildRecipeListingHref(basePath, { ...query, page: page + 1 })
      : null;

  return (
    <nav
      aria-label="ניווט בין עמודים"
      className={cn("recipes-listing-pagination", className)}
    >
      {previousHref ? (
        <Link
          href={previousHref}
          className="recipes-listing-pagination__link public-focus-ring"
        >
          הקודם
        </Link>
      ) : (
        <span className="recipes-listing-pagination__link recipes-listing-pagination__link--disabled">
          הקודם
        </span>
      )}

      <p className="recipes-listing-pagination__status">
        עמוד {page} מתוך {totalPages}
      </p>

      {nextHref ? (
        <Link
          href={nextHref}
          className="recipes-listing-pagination__link public-focus-ring"
        >
          הבא
        </Link>
      ) : (
        <span className="recipes-listing-pagination__link recipes-listing-pagination__link--disabled">
          הבא
        </span>
      )}
    </nav>
  );
}
