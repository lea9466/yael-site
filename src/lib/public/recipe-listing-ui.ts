import type { PublicRecipeTag } from "@/lib/public/recipe-listing";
import type { PublicRecipeListingQuery } from "@/lib/validations/public-recipe-listing";

export const RECIPE_LISTING_SORT_UI = [
  { value: "newest", label: "החדשים ביותר" },
  { value: "title", label: "א-ת" },
] as const;

export function parseRecipeListingTagSlugs(tag: string): string[] {
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

export function serializeRecipeListingTagSlugs(slugs: string[]): string {
  const unique = [
    ...new Set(slugs.map((slug) => slug.trim()).filter(Boolean)),
  ];

  return unique.length > 0 ? unique.join(",") : "all";
}

export function countActiveRecipeListingFilters(
  query: PublicRecipeListingQuery
): number {
  let count = 0;

  if (parseRecipeListingTagSlugs(query.tag).length > 0) {
    count += 1;
  }

  if (query.sort !== "newest") {
    count += 1;
  }

  return count;
}

export function getRecipeListingActiveFilterChips(input: {
  query: PublicRecipeListingQuery;
  tags: PublicRecipeTag[];
}): Array<{ key: string; label: string; type: "tag" | "sort" }> {
  const chips: Array<{
    key: string;
    label: string;
    type: "tag" | "sort";
  }> = [];

  for (const slug of parseRecipeListingTagSlugs(input.query.tag)) {
    const tag = input.tags.find((item) => item.slug === slug || item.id === slug);
    chips.push({
      key: `tag:${slug}`,
      label: tag?.name ?? slug,
      type: "tag",
    });
  }

  if (input.query.sort !== "newest") {
    const sortLabel =
      RECIPE_LISTING_SORT_UI.find((item) => item.value === input.query.sort)
        ?.label ?? "מיון";
    chips.push({
      key: `sort:${input.query.sort}`,
      label: sortLabel,
      type: "sort",
    });
  }

  return chips;
}

export function formatRecipeListingCount(count: number): string {
  if (count === 1) {
    return "מתכון אחד";
  }

  return `${count} מתכונים`;
}
