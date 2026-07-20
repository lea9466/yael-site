import Link from "next/link";

import {
  formatBlogListingCount,
  getBlogListingActiveFilterChips,
  parseBlogListingTagSlugs,
  serializeBlogListingTagSlugs,
} from "@/lib/public/blog-listing-ui";
import { buildBlogListingHref } from "@/lib/public/blog-paths";
import type { PublicBlogTag } from "@/lib/public/blog-listing";
import type { PublicBlogListingQuery } from "@/lib/validations/public-blog-listing";
import { cn } from "@/lib/utils/cn";

type BlogListingResultsBarProps = {
  basePath: string;
  query: PublicBlogListingQuery;
  tags: PublicBlogTag[];
  totalCount: number;
  className?: string;
};

export function BlogListingResultsBar({
  basePath,
  query,
  tags,
  totalCount,
  className,
}: BlogListingResultsBarProps) {
  const chips = getBlogListingActiveFilterChips({ query, tags });

  return (
    <div className={cn("recipes-listing-results", className)}>
      <p className="recipes-listing-results__count">
        {formatBlogListingCount(totalCount)}
      </p>

      {chips.length > 0 ? (
        <ul className="recipes-listing-results__chips" aria-label="סינון פעיל">
          {chips.map((chip) => {
            let href = basePath;

            if (chip.type === "tag") {
              const slug = chip.key.replace("tag:", "");
              const nextTags = parseBlogListingTagSlugs(query.tag).filter(
                (item) => item !== slug
              );
              href = buildBlogListingHref(basePath, {
                ...query,
                tag: serializeBlogListingTagSlugs(nextTags),
                page: 1,
              });
            } else {
              href = buildBlogListingHref(basePath, {
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
