import Link from "next/link";

import {
  formatRecipeListingCount,
  getRecipeListingActiveFilterChips,
  parseRecipeListingTagSlugs,
  serializeRecipeListingTagSlugs,
} from "@/lib/public/recipe-listing-ui";
import { buildRecipeListingHref } from "@/lib/public/recipe-paths";
import type { PublicRecipeTag } from "@/lib/public/recipe-listing";
import type { PublicRecipeListingQuery } from "@/lib/validations/public-recipe-listing";
import { cn } from "@/lib/utils/cn";

type RecipesListingResultsBarProps = {
  basePath: string;
  query: PublicRecipeListingQuery;
  tags: PublicRecipeTag[];
  totalCount: number;
  className?: string;
};

export function RecipesListingResultsBar({
  basePath,
  query,
  tags,
  totalCount,
  className,
}: RecipesListingResultsBarProps) {
  const chips = getRecipeListingActiveFilterChips({ query, tags });

  return (
    <div className={cn("recipes-listing-results", className)}>
      <p className="recipes-listing-results__count">
        {formatRecipeListingCount(totalCount)}
      </p>

      {chips.length > 0 ? (
        <ul className="recipes-listing-results__chips" aria-label="סינון פעיל">
          {chips.map((chip) => {
            let href = basePath;

            if (chip.type === "tag") {
              const slug = chip.key.replace("tag:", "");
              const nextTags = parseRecipeListingTagSlugs(query.tag).filter(
                (item) => item !== slug
              );
              href = buildRecipeListingHref(basePath, {
                ...query,
                tag: serializeRecipeListingTagSlugs(nextTags),
                page: 1,
              });
            } else {
              href = buildRecipeListingHref(basePath, {
                ...query,
                sort: "newest",
                page: 1,
              });
            }

            return (
              <li key={chip.key}>
                <Link
                  href={href}
                  className="recipes-listing-results__chip public-focus-ring"
                >
                  <span>{chip.label}</span>
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">הסרת סינון {chip.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
