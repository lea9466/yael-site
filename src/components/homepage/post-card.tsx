import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
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
  const href = buildPostPath(post.slug);
  const statusPills = getPostStatusPills(post);
  const { readingTime } = getPostCardMeta(post);

  return (
    <article className={cn("post-card group", className)}>
      <div className="post-card__media-wrap">
        <Link
          href={href}
          className="post-card__media public-focus-ring"
          aria-label={post.title}
        >
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.coverAlt ?? post.title}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
              className="post-card__image"
            />
          ) : (
            <div className="post-card__media-fallback">{post.title}</div>
          )}
        </Link>

        {statusPills.length > 0 ? (
          <ul className="post-card__pills" aria-label="סטטוס">
            {statusPills.map((pill) => (
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
      </div>

      <div className="post-card__body">
        {readingTime ? (
          <div className="post-card__meta-row">
            <span className="post-card__reading">
              <Clock aria-hidden="true" className="post-card__meta-icon" />
              {readingTime}
            </span>
          </div>
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
      </div>
    </article>
  );
}
