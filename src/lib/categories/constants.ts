export const CATEGORIES_PAGE_SIZE = 20;

export const CATEGORY_TYPES = ["recipe", "article"] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export { CONTENT_TYPE_LABELS as CATEGORY_TYPE_LABELS } from "@/lib/content-types/system";

export const RESERVED_CATEGORY_SLUGS = [
  "admin",
  "api",
  "login",
  "about",
  "services",
  "recipes",
  "articles",
  "contact",
  "privacy",
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

export const CATEGORY_NAME_MAX = 80;
export const CATEGORY_SLUG_MAX = 120;
