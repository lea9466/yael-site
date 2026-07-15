import { RESERVED_TAG_SLUGS } from "@/lib/tags/constants";

const SLUG_PATTERN = /^[a-z0-9\u05D0-\u05EA]+(-[a-z0-9\u05D0-\u05EA]+)*$/;

export function slugifyTagName(name: string): string {
  const slug = name
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^a-z0-9\u05D0-\u05EA\s-]/g, " ")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug.length > 0 ? slug : "tag";
}

export function isValidTagSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function isReservedTagSlug(slug: string): boolean {
  return (RESERVED_TAG_SLUGS as readonly string[]).includes(slug);
}
