import Link from "next/link";

import { buildBlogPath } from "@/lib/public/blog-paths";
import { cn } from "@/lib/utils/cn";

type ArticleBreadcrumbsProps = {
  postTitle: string;
  className?: string;
};

export function ArticleBreadcrumbs({
  postTitle,
  className,
}: ArticleBreadcrumbsProps) {
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
