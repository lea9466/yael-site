import { RESERVED_CATEGORY_SLUGS } from "@/lib/categories/constants";
import {
  buildUniqueSlug,
  isValidSlug,
  slugifyHebrewTitle,
} from "@/lib/slug/hebrew-slug";

export function slugifyCategoryName(name: string): string {
  return slugifyHebrewTitle(name, "category");
}

export function isValidCategorySlug(slug: string): boolean {
  return isValidSlug(slug);
}

export function isReservedCategorySlug(slug: string): boolean {
  return (RESERVED_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export async function buildUniqueCategorySlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  return buildUniqueSlug(baseSlug, isTaken);
}
