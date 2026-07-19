import { formatReadingTimeLabel } from "@/lib/articles/format";
import type { ShortAboutHighlightVariant } from "@/lib/homepage/short-about-highlights";
import type { PublicPostSummary } from "@/lib/public/types";

export type PostCardPill = {
  label: string;
  variant: ShortAboutHighlightVariant;
};

const NEW_POST_WINDOW_MS = 1000 * 60 * 60 * 24 * 45;

const CATEGORY_VARIANTS: ShortAboutHighlightVariant[] = [
  "mint",
  "teal",
  "gold",
  "coral",
];

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

function getCategoryVariant(categoryName: string): ShortAboutHighlightVariant {
  let hash = 0;

  for (let index = 0; index < categoryName.length; index += 1) {
    hash = (hash + categoryName.charCodeAt(index) * (index + 1)) % 997;
  }

  return CATEGORY_VARIANTS[hash % CATEGORY_VARIANTS.length] ?? "mint";
}

export function partitionHomepagePosts(posts: PublicPostSummary[]): {
  featured: PublicPostSummary;
  secondary: PublicPostSummary[];
} {
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const secondary = posts
    .filter((post) => post.id !== featured.id)
    .sort(sortByPublishedDesc);

  return { featured, secondary };
}

export function getFeaturedPostPills(post: PublicPostSummary): PostCardPill[] {
  const pills: PostCardPill[] = [];

  if (post.featured) {
    pills.push({ label: "מומלץ", variant: "coral" });
  }

  if (post.categoryName) {
    pills.push({
      label: post.categoryName,
      variant: getCategoryVariant(post.categoryName),
    });
  }

  if (post.reading_time_minutes > 0 && pills.length < 3) {
    pills.push({
      label: formatReadingTimeLabel(post.reading_time_minutes),
      variant: "gold",
    });
  }

  return pills.slice(0, 3);
}

export function getCompactPostPills(post: PublicPostSummary): PostCardPill[] {
  const pills: PostCardPill[] = [];

  if (!post.featured && isRecentlyPublished(post.published_at)) {
    pills.push({ label: "חדש", variant: "teal" });
  }

  return pills;
}

export function getCompactPostMeta(post: PublicPostSummary): {
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
