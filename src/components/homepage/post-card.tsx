import Image from "next/image";
import Link from "next/link";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
import { getPostCardPills } from "@/lib/homepage/post-card-display";
import type { PublicPostSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type PostCardProps = {
  post: PublicPostSummary;
  featured?: boolean;
  className?: string;
};

export function PostCard({
  post,
  featured = false,
  className,
}: PostCardProps) {
  const href = `/articles/${post.slug}`;
  const pills = getPostCardPills(post);

  return (
    <article
      className={cn(
        "post-card group",
        featured && "post-card--featured",
        className
      )}
    >
      <Link href={href} className="post-card__media public-focus-ring" aria-label={post.title}>
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? post.title}
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
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

        <div className="post-card__copy">
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
        </div>

        <Link href={href} className="hero-btn hero-btn--secondary post-card__cta public-focus-ring">
          לקריאה
        </Link>
      </div>
    </article>
  );
}
