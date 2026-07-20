import Link from "next/link";
import { Star } from "lucide-react";

import {
  buildRecipeCategoryPath,
  buildRecipesPath,
} from "@/lib/public/recipe-paths";
import { getRecipeTagPillTone } from "@/lib/recipes/tag-pill-tone";
import type { RecipeCategorySummary, RecipeTagSummary } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipeBadgesProps = {
  featured: boolean;
  category: RecipeCategorySummary | null;
  tags: RecipeTagSummary[];
  className?: string;
};

const VISIBLE_TAG_LIMIT = 6;

export function RecipeBadges({
  featured,
  category,
  tags,
  className,
}: RecipeBadgesProps) {
  const visibleTags = tags.slice(0, VISIBLE_TAG_LIMIT);
  const overflowCount = Math.max(tags.length - VISIBLE_TAG_LIMIT, 0);
  const categoryHref = category?.slug
    ? buildRecipeCategoryPath(category.slug)
    : buildRecipesPath();

  if (!featured && !category && visibleTags.length === 0) {
    return null;
  }

  return (
    <ul className={cn("recipe-badges", className)} aria-label="תגיות המתכון">
      {featured ? (
        <li>
          <span className="recipe-badges__pill recipe-badges__pill--featured">
            <Star aria-hidden="true" className="recipe-badges__icon" />
            מומלץ
          </span>
        </li>
      ) : null}

      {category ? (
        <li>
          <Link
            href={categoryHref}
            className="recipe-badges__pill recipe-badges__pill--category public-focus-ring"
          >
            {category.name}
          </Link>
        </li>
      ) : null}

      {visibleTags.map((tag, index) => (
        <li key={tag.id}>
          <span
            className={cn(
              "recipe-badges__pill",
              `recipe-badges__pill--${getRecipeTagPillTone(index)}`
            )}
          >
            {tag.name}
          </span>
        </li>
      ))}

      {overflowCount > 0 ? (
        <li>
          <span className="recipe-badges__pill recipe-badges__pill--overflow">
            +{overflowCount}
          </span>
        </li>
      ) : null}
    </ul>
  );
}
