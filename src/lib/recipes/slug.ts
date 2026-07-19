import { RESERVED_RECIPE_SLUGS } from "@/lib/recipes/constants";
import {
  buildUniqueSlug,
  isValidSlug,
  slugifyHebrewTitle,
} from "@/lib/slug/hebrew-slug";

export function slugifyTitle(title: string): string {
  return slugifyHebrewTitle(title, "recipe");
}

export function isValidRecipeSlug(slug: string): boolean {
  return isValidSlug(slug);
}

export function isReservedRecipeSlug(slug: string): boolean {
  return (RESERVED_RECIPE_SLUGS as readonly string[]).includes(slug);
}

export async function buildUniqueRecipeSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  return buildUniqueSlug(baseSlug, isTaken);
}

export function buildDuplicateTitle(title: string): string {
  const suffix = "(עותק)";

  if (title.endsWith(suffix)) {
    return `${title} 2`;
  }

  return `${title} ${suffix}`;
}

export function buildDuplicateSlugBase(slug: string): string {
  const copySuffix = "-copy";

  if (slug.endsWith(copySuffix)) {
    return `${slug}-2`;
  }

  return `${slug}${copySuffix}`;
}
