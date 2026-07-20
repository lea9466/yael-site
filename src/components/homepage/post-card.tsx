import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
import { formatArticleDateShort } from "@/lib/articles/format";
import {
  getPostCardMeta,
  getPostStatusPills,
} from "@/lib/homepage/post-card-display";
import { buildPostPath } from "@/lib/public/blog-paths";
import type { PublicPostSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type PostCardProps = {
  post: PublicPostSummary;
  className?: string;
};

export function PostCard({ post, className }: PostCardProps) {
  const href = buildPostPath(post.categorySlug, post.slug);
  const statusPills = getPostStatusPills(post);
  const { category, readingTime } = getPostCardMeta(post);
  const publishedLabel = post.published_at
    ? formatArticleDateShort(post.published_at)
    : null;

  return (
    <article className={cn("recipe-card group", className)}>
      <div className="recipe-card__body">
        {category ? (
          <ul className="recipe-card__tags" aria-label="קטגוריה">
            <li>
              <span className="recipe-card__tag">{category}</span>
            </li>
          </ul>
        ) : null}

        <h3 className="recipe-card__title">
          <Link href={href} className="public-focus-ring rounded-[var(--radius-sm)]">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? (
          <MultilineText as="p" className="recipe-card__description">
            {post.excerpt}
          </MultilineText>
        ) : null}

        {(readingTime || publishedLabel) ? (
          <div className="recipe-card__meta">
            {readingTime ? (
              <div className="recipe-card__meta-item">
                <Clock aria-hidden="true" className="recipe-card__meta-icon" />
                <span>{readingTime}</span>
              </div>
            ) : null}
            {publishedLabel ? (
              <div className="recipe-card__meta-item">
                <CalendarDays
                  aria-hidden="true"
                  className="recipe-card__meta-icon"
                />
                <span>{publishedLabel}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <Link href={href} className="recipe-card__cta public-focus-ring">
          לקריאה
        </Link>
      </div>

      <Link
        href={href}
        className="recipe-card__media public-focus-ring"
        aria-label={post.title}
      >
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
            className="recipe-card__image"
          />
        ) : (
          <div className="recipe-card__media-fallback">{post.title}</div>
        )}

        {statusPills[0] ? (
          <PublicHighlightPill
            label={statusPills[0].label}
            variant={statusPills[0].variant}
            floating={false}
            className="recipe-card__featured-badge"
          />
        ) : null}
      </Link>
    </article>
  );
}
