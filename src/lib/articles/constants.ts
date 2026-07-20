import type { ContentStatus } from "@/types/content";

export const ARTICLES_PAGE_SIZE = 20;

export const RESERVED_ARTICLE_SLUGS = [
  "admin",
  "api",
  "login",
  "about",
  "services",
  "recipes",
  "articles",
  "blog",
  "contact",
  "privacy",
  "terms",
  "testimonials",
  "certificates",
  "sitemap",
  "robots",
  "favicon",
  "preview",
] as const;

export const ARTICLE_REPEATER_LIMITS = {
  gallery: { min: 0, max: 6 },
  blocks: { min: 1, max: 200 },
  listItems: { min: 1, max: 50 },
} as const;

export const ARTICLE_BODY_MAX = 50_000;

export const READING_WORDS_PER_MINUTE = 200;

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "טיוטה",
  published: "מפורסם",
  archived: "ארכיון",
};

export const TAG_PILL_CLASSES = [
  "bg-[var(--color-sky-blue-soft)] text-[var(--color-sky-blue)] ring-[var(--color-sky-blue)]/25",
  "bg-[var(--color-fresh-green-soft)] text-[var(--color-fresh-green)] ring-[var(--color-fresh-green)]/25",
  "bg-[var(--color-coral-soft)] text-[var(--color-soft-accent)] ring-[var(--color-soft-accent)]/25",
  "bg-[var(--color-warm-gold-soft)] text-[var(--color-warm-gold)] ring-[var(--color-warm-gold)]/25",
  "bg-[var(--color-light-sage-soft)] text-[var(--color-primary)] ring-[var(--color-primary)]/20",
] as const;
