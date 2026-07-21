import { RESERVED_SERVICE_SLUGS } from "@/lib/services/constants";
import {
  buildUniqueSlug,
  isValidSlug,
  slugifyHebrewTitle,
} from "@/lib/slug/hebrew-slug";

export function slugifyTitle(title: string): string {
  const trimmed = title.trim();

  if (!trimmed) {
    return "";
  }

  return slugifyHebrewTitle(trimmed, "service");
}

/** Technical slug for drafts saved without a title yet. */
export function createDraftServiceSlugBase(): string {
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  return `service-${token}`;
}

export function isValidServiceSlug(slug: string): boolean {
  return isValidSlug(slug);
}

export function isReservedServiceSlug(slug: string): boolean {
  return (RESERVED_SERVICE_SLUGS as readonly string[]).includes(slug);
}

export async function buildUniqueServiceSlug(
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
