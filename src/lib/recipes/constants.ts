import type { ContentStatus } from "@/types/content";

export const RECIPES_PAGE_SIZE = 20;

export const RESERVED_RECIPE_SLUGS = [
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

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy: "קל",
  medium: "בינוני",
  hard: "מאתגר",
};

export const RECIPE_REPEATER_LIMITS = {
  sections: { min: 1, max: 20 },
  ingredients: { min: 0, max: 100 },
  steps: { min: 0, max: 50 },
  gallery: { min: 0, max: 6 },
} as const;

export const RECIPE_DESCRIPTION_MAX = 2000;

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

export const RECIPE_FORM_SECTIONS = [
  { id: "basic", label: "מידע בסיסי" },
  { id: "details", label: "פרטי המתכון" },
  { id: "sections", label: "חלקי המתכון" },
  { id: "tip", label: "הטיפ של יעל" },
  { id: "gallery", label: "גלריה" },
] as const;

export type RecipeFormSectionId = (typeof RECIPE_FORM_SECTIONS)[number]["id"];
