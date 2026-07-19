import { RESERVED_TAG_SLUGS } from "@/lib/tags/constants";
import { isValidSlug, slugifyHebrewTitle } from "@/lib/slug/hebrew-slug";

export function slugifyTagName(name: string): string {
  return slugifyHebrewTitle(name, "tag");
}

export function isValidTagSlug(slug: string): boolean {
  return isValidSlug(slug);
}

export function isReservedTagSlug(slug: string): boolean {
  return (RESERVED_TAG_SLUGS as readonly string[]).includes(slug);
}
