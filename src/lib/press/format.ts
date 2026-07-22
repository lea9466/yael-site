import { RESERVED_PRESS_SLUGS } from "@/lib/press/constants";
import {
  buildUniqueSlug,
  isValidSlug,
  slugifyHebrewTitle,
} from "@/lib/slug/hebrew-slug";

export function slugifyPressTitle(title: string): string {
  return slugifyHebrewTitle(title, "press");
}

export function isValidPressSlug(slug: string): boolean {
  return isValidSlug(slug);
}

export function isReservedPressSlug(slug: string): boolean {
  return (RESERVED_PRESS_SLUGS as readonly string[]).includes(slug);
}

export async function buildUniquePressSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  return buildUniqueSlug(baseSlug, isTaken);
}
