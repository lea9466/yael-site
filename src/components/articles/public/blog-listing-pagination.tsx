import Link from "next/link";

import { buildBlogListingHref } from "@/lib/public/blog-paths";
import type { PublicBlogListingQuery } from "@/lib/validations/public-blog-listing";
import { cn } from "@/lib/utils/cn";

type BlogListingPaginationProps = {
  basePath: string;
  query: PublicBlogListingQuery;
  page: number;
  totalPages: number;
  className?: string;
};

export function BlogListingPagination({
  basePath,
  query,
  page,
  totalPages,
  className,
}: BlogListingPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousHref =
    page > 1
      ? buildBlogListingHref(basePath, { ...query, page: page - 1 })
      : null;
  const nextHref =
    page < totalPages
      ? buildBlogListingHref(basePath, { ...query, page: page + 1 })
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
