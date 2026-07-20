import Link from "next/link";
import { Star } from "lucide-react";

import {
  buildBlogCategoryPath,
  buildBlogPath,
} from "@/lib/public/blog-paths";
import { getRecipeTagPillTone } from "@/lib/recipes/tag-pill-tone";
import type {
  ArticleCategorySummary,
  ArticleTagSummary,
} from "@/lib/articles/types";
import { cn } from "@/lib/utils/cn";

type ArticleBadgesProps = {
  featured: boolean;
  category: ArticleCategorySummary | null;
  tags: ArticleTagSummary[];
  className?: string;
};

const VISIBLE_TAG_LIMIT = 6;

export function ArticleBadges({
  featured,
  category,
  tags,
  className,
}: ArticleBadgesProps) {
  const visibleTags = tags.slice(0, VISIBLE_TAG_LIMIT);
  const overflowCount = Math.max(tags.length - VISIBLE_TAG_LIMIT, 0);
  const categoryHref = category?.slug
    ? buildBlogCategoryPath(category.slug)
    : buildBlogPath();

  if (!featured && !category && visibleTags.length === 0) {
    return null;
  }

  return (
    <ul className={cn("recipe-badges", className)} aria-label="תגיות הפוסט">
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
