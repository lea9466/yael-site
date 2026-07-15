import { BookOpen, ChefHat, type LucideIcon } from "lucide-react";

import { ADMIN_MODULE_THEMES } from "@/lib/admin/module-themes";

export const CONTENT_TYPES = ["recipe", "article"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  recipe: "מתכונים",
  article: "פוסטים",
};

export type ContentTypeTheme = {
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  accentRing: string;
  text: string;
  border: string;
  iconBackground: string;
  glow: string;
};

const RECIPE_THEME = ADMIN_MODULE_THEMES.recipes;
const POST_THEME = ADMIN_MODULE_THEMES.articles;

export const CONTENT_TYPE_THEMES: Record<ContentType, ContentTypeTheme> = {
  recipe: {
    icon: ChefHat,
    accent: RECIPE_THEME.accent,
    accentSoft: RECIPE_THEME.accentSoft,
    accentRing: RECIPE_THEME.accentRing,
    text: "var(--color-primary)",
    border: "color-mix(in srgb, var(--color-fresh-green) 45%, transparent)",
    iconBackground:
      "linear-gradient(135deg, var(--color-fresh-green) 0%, var(--color-secondary) 100%)",
    glow: "0 0 14px -4px color-mix(in srgb, var(--color-fresh-green) 35%, transparent)",
  },
  article: {
    icon: BookOpen,
    accent: POST_THEME.accent,
    accentSoft: POST_THEME.accentSoft,
    accentRing: POST_THEME.accentRing,
    text: "var(--color-sky-blue)",
    border: "color-mix(in srgb, var(--color-sky-blue) 45%, transparent)",
    iconBackground:
      "linear-gradient(135deg, var(--color-sky-blue) 0%, var(--color-primary) 100%)",
    glow: "0 0 14px -4px color-mix(in srgb, var(--color-sky-blue) 35%, transparent)",
  },
};

export function getContentTypeTheme(type: ContentType): ContentTypeTheme {
  return CONTENT_TYPE_THEMES[type];
}

export function getContentTypeLabel(type: ContentType): string {
  return CONTENT_TYPE_LABELS[type];
}

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}
