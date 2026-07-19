import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
import {
  getCompactPostMeta,
  getCompactPostPills,
  getFeaturedPostPills,
} from "@/lib/homepage/post-card-display";
import type { PublicPostSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type PostCardProps = {
  post: PublicPostSummary;
  variant: "featured" | "compact";
  className?: string;
};

export function PostCard({ post, variant, className }: PostCardProps) {
  const href = `/articles/${post.slug}`;

  if (variant === "compact") {
    const pills = getCompactPostPills(post);
    const { category, readingTime } = getCompactPostMeta(post);

    return (
      <article className={cn("post-card post-card--compact group", className)}>
        <div className="post-card__content">
          <div className="post-card__meta-row">
            {pills.length > 0 ? (
              <ul className="post-card__pills" aria-label="סטטוס">
                {pills.map((pill) => (
                  <li key={`${post.id}-${pill.label}`}>
                    <PublicHighlightPill
                      label={pill.label}
                      variant={pill.variant}
                      floating={false}
                    />
                  </li>
                ))}
              </ul>
            ) : null}

            {(category || readingTime) ? (
              <div className="post-card__meta">
                {category ? <span>{category}</span> : null}
                {readingTime ? (
                  <span className="post-card__meta-item">
                    <Clock aria-hidden="true" className="post-card__meta-icon" />
                    {readingTime}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <h3 className="post-card__title">
            <Link href={href} className="public-focus-ring rounded-[var(--radius-sm)]">
              {post.title}
            </Link>
          </h3>

          {post.excerpt ? (
            <MultilineText as="p" className="post-card__excerpt">
              {post.excerpt}
            </MultilineText>
          ) : null}

          <Link href={href} className="post-card__cta public-focus-ring">
            לקריאה ←
          </Link>
        </div>

        <Link
          href={href}
          className="post-card__thumb public-focus-ring"
          aria-label={post.title}
        >
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.coverAlt ?? post.title}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 40vw, 22vw"
              className="post-card__image"
            />
          ) : (
            <div className="post-card__media-fallback">{post.title}</div>
          )}
        </Link>
      </article>
    );
  }

  const pills = getFeaturedPostPills(post);

  return (
    <article className={cn("post-card post-card--featured group", className)}>
      <Link href={href} className="post-card__media public-focus-ring" aria-label={post.title}>
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 100vw, 58vw"
            className="post-card__image"
          />
        ) : (
          <div className="post-card__media-fallback">{post.title}</div>
        )}
      </Link>

      <div className="post-card__body">
        {pills.length > 0 ? (
          <ul className="post-card__pills" aria-label="מידע על המאמר">
            {pills.map((pill) => (
              <li key={`${post.id}-${pill.label}`}>
                <PublicHighlightPill
                  label={pill.label}
                  variant={pill.variant}
                  floating={false}
                />
              </li>
            ))}
          </ul>
        ) : null}

        <h3 className="post-card__title">
          <Link href={href} className="public-focus-ring rounded-[var(--radius-sm)]">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? (
          <MultilineText as="p" className="post-card__excerpt">
            {post.excerpt}
          </MultilineText>
        ) : null}

        <Link href={href} className="post-card__cta public-focus-ring">
          לקריאת המאמר ←
        </Link>
      </div>
    </article>
  );
}
