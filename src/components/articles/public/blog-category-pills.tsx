import Link from "next/link";

import {
  buildBlogCategoryPath,
  buildBlogPath,
} from "@/lib/public/blog-paths";
import type { PublicBlogCategory } from "@/lib/public/blog-listing";
import { cn } from "@/lib/utils/cn";

type BlogCategoryPillsProps = {
  categories: PublicBlogCategory[];
  activeSlug?: string | null;
  className?: string;
};

export function BlogCategoryPills({
  categories,
  activeSlug,
  className,
}: BlogCategoryPillsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="קטגוריות בלוג"
      className={cn("recipes-category-pills", className)}
    >
      <ul className="recipes-category-pills__list">
        <li>
          <Link
            href={buildBlogPath()}
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
                href={buildBlogCategoryPath(category.slug)}
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
