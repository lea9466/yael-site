import { HOMEPAGE_DISPLAY_LIMITS } from "@/lib/homepage/constants";

type FeaturedSortable = {
  featured: boolean;
  published_at?: string | null;
  updated_at?: string | null;
};

export function sortFeaturedFirst<T extends FeaturedSortable>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const leftDate = left.published_at ?? left.updated_at ?? null;
    const rightDate = right.published_at ?? right.updated_at ?? null;

    if (!leftDate && !rightDate) {
      return 0;
    }

    if (!leftDate) {
      return 1;
    }

    if (!rightDate) {
      return -1;
    }

    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });
}

export function takeHomepageLimit<T>(
  items: T[],
  key: keyof typeof HOMEPAGE_DISPLAY_LIMITS
): T[] {
  return items.slice(0, HOMEPAGE_DISPLAY_LIMITS[key]);
}

export function selectHomepageItems<T extends FeaturedSortable>(
  items: T[],
  key: keyof typeof HOMEPAGE_DISPLAY_LIMITS
): T[] {
  return takeHomepageLimit(sortFeaturedFirst(items), key);
}
