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

export function getPostCardPills(post: PublicPostSummary): PostCardPill[] {
  const pills: PostCardPill[] = [];

  if (post.featured) {
    pills.push({ label: "מומלץ", variant: "coral" });
  } else if (isRecentlyPublished(post.published_at)) {
    pills.push({ label: "חדש", variant: "teal" });
  }

  if (post.categoryName) {
    pills.push({
      label: post.categoryName,
      variant: getCategoryVariant(post.categoryName),
    });
  }

  if (post.reading_time_minutes > 0) {
    pills.push({
      label: formatReadingTimeLabel(post.reading_time_minutes),
      variant: "gold",
    });
  }

  return pills;
}

export function getPrimaryFeaturedPostId(
  posts: PublicPostSummary[]
): string | null {
  return posts.find((post) => post.featured)?.id ?? null;
}
