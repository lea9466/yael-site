import Link from "next/link";
import { BookOpen } from "lucide-react";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { PostCard } from "@/components/homepage/post-card";
import { PublicEmptyState } from "@/components/public/states/public-empty-state";
import {
  BlogListingBreadcrumbJsonLd,
  BlogListingBreadcrumbs,
} from "@/components/articles/public/blog-listing-breadcrumbs";
import { BlogListingFilters } from "@/components/articles/public/blog-listing-filters";
import { BlogListingHero } from "@/components/articles/public/blog-listing-hero";
import { BlogListingPagination } from "@/components/articles/public/blog-listing-pagination";
import { BlogListingResultsBar } from "@/components/articles/public/blog-listing-results-bar";
import { BlogListingSearch } from "@/components/articles/public/blog-listing-search";
import { buildBlogPath } from "@/lib/public/blog-paths";
import { parseBlogListingTagSlugs } from "@/lib/public/blog-listing-ui";
import type { PublicBlogListingResult } from "@/lib/public/blog-listing";
import { cn } from "@/lib/utils/cn";

type BlogListingProps = {
  data: PublicBlogListingResult;
};

export function BlogListing({ data }: BlogListingProps) {
  const { posts, tags, query, totalCount, totalPages } = data;
  const basePath = buildBlogPath();
  const hasActiveFilters =
    query.q.length > 0 || parseBlogListingTagSlugs(query.tag).length > 0;

  return (
    <>
      <BlogListingBreadcrumbJsonLd />

      <section
        aria-labelledby="blog-page-title"
        className="recipes-section recipes-page recipes-listing"
      >
        <div className="recipes-section__inner recipes-listing__inner">
          <BlogListingBreadcrumbs />

          <BlogListingHero />

          <div className="recipes-listing-toolbar">
            <BlogListingSearch basePath={basePath} query={query} />
            <BlogListingFilters
              basePath={basePath}
              query={query}
              tags={tags}
            />
          </div>

          <BlogListingResultsBar
            basePath={basePath}
            query={query}
            tags={tags}
            totalCount={totalCount}
          />

          {posts.length > 0 ? (
            <>
              <ul
                className={cn(
                  "recipes-section__grid recipes-listing__grid",
                  `recipes-section__grid--count-${Math.min(posts.length, 3)}`
                )}
              >
                {posts.map((post, index) => (
                  <li key={post.id} className="recipes-section__item">
                    <HomepageReveal delayMs={(index % 3) * 250}>
                      <PostCard post={post} />
                    </HomepageReveal>
                  </li>
                ))}
              </ul>

              <BlogListingPagination
                basePath={basePath}
                query={query}
                page={query.page}
                totalPages={totalPages}
              />
            </>
          ) : (
            <PublicEmptyState
              icon={BookOpen}
              title={hasActiveFilters ? "לא נמצאו פוסטים" : "עדיין אין פוסטים לפרסום"}
              description={
                hasActiveFilters
                  ? "נסי לשנות את החיפוש או את הסינון."
                  : "בקרוב יתווספו כאן פוסטים חדשים."
              }
              action={
                hasActiveFilters ? (
                  <Link
                    href={basePath}
                    className="recipes-listing__empty-action public-focus-ring"
                  >
                    איפוס סינון
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
