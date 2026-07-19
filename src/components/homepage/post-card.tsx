import Image from "next/image";
import Link from "next/link";

import { SectionCTA } from "@/components/homepage/section-cta";
import { formatReadingTimeLabel } from "@/lib/articles/format";
import type { PublicPostSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type PostCardProps = {
  post: PublicPostSummary;
  className?: string;
};

export function PostCard({ post, className }: PostCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <Link
        href={`/articles/${post.slug}`}
        className="public-focus-ring relative block aspect-[16/10] overflow-hidden bg-[var(--color-sky-blue-soft)]"
      >
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[var(--transition-slow)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--color-sky-blue)]">
            {post.title}
          </div>
        )}
        {post.featured ? (
          <span className="status-badge absolute start-3 top-3" data-size="sm" data-variant="featured">
            <span className="status-badge-label">מומלץ</span>
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.categoryName ? (
            <span className="inline-flex rounded-[var(--radius-full)] bg-[var(--color-sky-blue-soft)] px-3 py-1 text-xs font-medium text-[var(--color-sky-blue)] ring-1 ring-[var(--color-sky-blue)]/20">
              {post.categoryName}
            </span>
          ) : null}
          <span className="text-caption text-[var(--color-text-muted)]">
            {formatReadingTimeLabel(post.reading_time_minutes)}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-card-title line-clamp-2">
            <Link
              href={`/articles/${post.slug}`}
              className="public-focus-ring rounded-[var(--radius-sm)] transition-colors hover:text-[var(--color-sky-blue)]"
            >
              {post.title}
            </Link>
          </h3>
          <p className="text-muted line-clamp-3 text-sm">{post.excerpt}</p>
        </div>
        <div className="mt-auto pt-1">
          <SectionCTA
            label="לקריאה"
            href={`/articles/${post.slug}`}
            variant="ghost"
            className="min-h-0 px-0 text-[var(--color-sky-blue)]"
          />
        </div>
      </div>
    </article>
  );
}
