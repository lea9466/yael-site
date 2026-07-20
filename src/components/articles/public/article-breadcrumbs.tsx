import Link from "next/link";

import type { ArticleCategorySummary } from "@/lib/articles/types";
import {
  buildBlogCategoryPath,
  buildBlogPath,
} from "@/lib/public/blog-paths";
import { cn } from "@/lib/utils/cn";

type ArticleBreadcrumbsProps = {
  postTitle: string;
  category: ArticleCategorySummary | null;
  className?: string;
};

export function ArticleBreadcrumbs({
  postTitle,
  category,
  className,
}: ArticleBreadcrumbsProps) {
  const categoryHref = category?.slug
    ? buildBlogCategoryPath(category.slug)
    : buildBlogPath();

  return (
    <nav
      aria-label="ניווט פירורי לחם"
      className={cn("post-article__breadcrumbs", className)}
    >
      <ol className="post-article__breadcrumbs-list">
        <li>
          <Link href="/" className="post-article__breadcrumbs-link public-focus-ring">
            בית
          </Link>
        </li>
        <li aria-hidden="true" className="post-article__breadcrumbs-sep">
          /
        </li>
        <li>
          <Link
            href={buildBlogPath()}
            className="post-article__breadcrumbs-link public-focus-ring"
          >
            בלוג
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden="true" className="post-article__breadcrumbs-sep">
              /
            </li>
            <li>
              <Link
                href={categoryHref}
                className="post-article__breadcrumbs-link public-focus-ring"
              >
                {category.name}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden="true" className="post-article__breadcrumbs-sep">
          /
        </li>
        <li>
          <span aria-current="page" className="post-article__breadcrumbs-current">
            {postTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
