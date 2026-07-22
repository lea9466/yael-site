export const TAGS_PAGE_SIZE = 20;

export const TAG_TYPES = ["recipe", "article"] as const;

export type TagType = (typeof TAG_TYPES)[number];

export { CONTENT_TYPE_LABELS as TAG_TYPE_LABELS } from "@/lib/content-types/system";

export const RESERVED_TAG_SLUGS = [
  "admin",
  "api",
  "login",
  "about",
  "services",
  "recipes",
  "articles",
  "contact",
  "privacy",
  "privacy-policy",
  "terms",
  "testimonials",
  "certificates",
  "sitemap",
  "robots",
  "favicon",
  "preview",
  "categories",
  "tags",
] as const;

export const TAG_NAME_MAX = 80;
export const TAG_SLUG_MAX = 120;
