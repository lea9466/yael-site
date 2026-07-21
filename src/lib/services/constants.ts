import type { ContentStatus } from "@/types/content";

export const SERVICES_PAGE_SIZE = 20;

export const RESERVED_SERVICE_SLUGS = [
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
] as const;

export const SERVICE_REPEATER_LIMITS = {
  target_audience: { min: 0, max: 20 },
  benefits: { min: 0, max: 20 },
  process_steps: { min: 0, max: 15 },
  faq: { min: 0, max: 20 },
} as const;

export const SERVICE_UNTITLED_LABEL = "שירות ללא כותרת";

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "טיוטה",
  published: "מפורסם",
  archived: "ארכיון",
};

export const STATUS_BADGE_VARIANT: Record<
  ContentStatus,
  "neutral" | "success" | "warning"
> = {
  draft: "neutral",
  published: "success",
  archived: "warning",
};

export const SERVICE_FORM_SECTIONS = [
  { id: "basic", label: "מידע בסיסי" },
  { id: "content", label: "תוכן השירות" },
  { id: "audience", label: "למי מתאים" },
  { id: "benefits", label: "יתרונות" },
  { id: "process", label: "שלבי התהליך" },
  { id: "faq", label: "שאלות נפוצות" },
  { id: "cta", label: "הנעה לפעולה" },
] as const;

export type ServiceFormSectionId = (typeof SERVICE_FORM_SECTIONS)[number]["id"];
