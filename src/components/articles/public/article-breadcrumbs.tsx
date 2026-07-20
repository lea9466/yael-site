import Link from "next/link";

import {
  buildBlogCategoryPath,
  buildBlogPath,
} from "@/lib/public/blog-paths";
import type { ArticleCategorySummary } from "@/lib/articles/types";
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
            href={buildBlogPath()}
            className="recipe-breadcrumbs__link public-focus-ring"
          >
            בלוג
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
            {postTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
