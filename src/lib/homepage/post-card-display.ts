import { formatReadingTimeLabel } from "@/lib/articles/format";
import type { ShortAboutHighlightVariant } from "@/lib/homepage/short-about-highlights";
import type { PublicPostSummary } from "@/lib/public/types";

export type PostCardPill = {
  label: string;
  variant: ShortAboutHighlightVariant;
};

const NEW_POST_WINDOW_MS = 1000 * 60 * 60 * 24 * 45;

function sortByPublishedDesc(
  left: PublicPostSummary,
  right: PublicPostSummary
): number {
  const leftTime = left.published_at ? Date.parse(left.published_at) : 0;
  const rightTime = right.published_at ? Date.parse(right.published_at) : 0;

  return rightTime - leftTime;
}

function isRecentlyPublished(publishedAt: string | null): boolean {
  if (!publishedAt) {
    return false;
  }

  const publishedTime = Date.parse(publishedAt);

  if (Number.isNaN(publishedTime)) {
    return false;
  }

  return Date.now() - publishedTime <= NEW_POST_WINDOW_MS;
}

/** Featured first, then newest — used for homepage card order. */
export function orderHomepagePosts(posts: PublicPostSummary[]): PublicPostSummary[] {
  return [...posts].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return sortByPublishedDesc(left, right);
  });
}

/** Glowing status pills only (מומלץ / חדש). */
export function getPostStatusPills(post: PublicPostSummary): PostCardPill[] {
  const pills: PostCardPill[] = [];

  if (post.featured) {
    pills.push({ label: "מומלץ", variant: "coral" });
  } else if (isRecentlyPublished(post.published_at)) {
    pills.push({ label: "חדש", variant: "teal" });
  }

  return pills;
}

export function getPostCardMeta(post: PublicPostSummary): {
  category: string | null;
  readingTime: string | null;
} {
  return {
    category: post.categoryName,
    readingTime:
      post.reading_time_minutes > 0
        ? formatReadingTimeLabel(post.reading_time_minutes)
        : null,
  };
}
