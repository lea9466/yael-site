import type { PublicBlogTag } from "@/lib/public/blog-listing";
import type { PublicBlogListingQuery } from "@/lib/validations/public-blog-listing";

export const BLOG_LISTING_SORT_UI = [
  { value: "newest", label: "החדשים ביותר" },
  { value: "oldest", label: "הישנים ביותר" },
  { value: "title", label: "א-ת" },
] as const;

export function parseBlogListingTagSlugs(tag: string): string[] {
  const trimmed = tag.trim();

  if (!trimmed || trimmed === "all") {
    return [];
  }

  return [
    ...new Set(
      trimmed
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0 && part !== "all")
    ),
  ];
}

export function serializeBlogListingTagSlugs(slugs: string[]): string {
  const unique = [
    ...new Set(slugs.map((slug) => slug.trim()).filter(Boolean)),
  ];

  return unique.length > 0 ? unique.join(",") : "all";
}

export function countActiveBlogListingFilters(
  query: PublicBlogListingQuery
): number {
  let count = 0;

  if (parseBlogListingTagSlugs(query.tag).length > 0) {
    count += 1;
  }

  if (query.sort !== "newest") {
    count += 1;
  }

  return count;
}

export function getBlogListingActiveFilterChips(input: {
  query: PublicBlogListingQuery;
  tags: PublicBlogTag[];
}): Array<{ key: string; label: string; type: "tag" | "sort" }> {
  const chips: Array<{
    key: string;
    label: string;
    type: "tag" | "sort";
  }> = [];

  for (const slug of parseBlogListingTagSlugs(input.query.tag)) {
    const tag = input.tags.find(
      (item) => item.slug === slug || item.id === slug
    );
    chips.push({
      key: `tag:${slug}`,
      label: tag?.name ?? slug,
      type: "tag",
    });
  }

  if (input.query.sort !== "newest") {
    const sortLabel =
      BLOG_LISTING_SORT_UI.find((item) => item.value === input.query.sort)
        ?.label ?? "מיון";
    chips.push({
      key: `sort:${input.query.sort}`,
      label: sortLabel,
      type: "sort",
    });
  }

  return chips;
}

export function formatBlogListingCount(count: number): string {
  if (count === 1) {
    return "פוסט אחד";
  }

  return `${count} פוסטים`;
}
