import Link from "next/link";

import {
  buildRecipeCategoryPath,
  buildRecipesPath,
} from "@/lib/public/recipe-paths";
import type { RecipeCategorySummary } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipeBreadcrumbsProps = {
  recipeTitle: string;
  category: RecipeCategorySummary | null;
  className?: string;
};

export function RecipeBreadcrumbs({
  recipeTitle,
  category,
  className,
}: RecipeBreadcrumbsProps) {
  const categoryHref = category?.slug
    ? buildRecipeCategoryPath(category.slug)
    : buildRecipesPath();

  return (
    <nav
      aria-label="ניווט פירורי לחם"
      className={cn("recipe-breadcrumbs", className)}
    >
      <ol className="recipe-breadcrumbs__list">
        <li className="recipe-breadcrumbs__item">
          <Link href="/" className="recipe-breadcrumbs__link public-focus-ring">
            בית
          </Link>
        </li>
        <li aria-hidden="true" className="recipe-breadcrumbs__separator">
          /
        </li>
        <li className="recipe-breadcrumbs__item">
          <Link
            href={buildRecipesPath()}
            className="recipe-breadcrumbs__link public-focus-ring"
          >
            מתכונים
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden="true" className="recipe-breadcrumbs__separator">
              /
            </li>
            <li className="recipe-breadcrumbs__item">
              <Link
                href={categoryHref}
                className="recipe-breadcrumbs__link public-focus-ring"
              >
                {category.name}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden="true" className="recipe-breadcrumbs__separator">
          /
        </li>
        <li className="recipe-breadcrumbs__item">
          <span aria-current="page" className="recipe-breadcrumbs__current">
            {recipeTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
