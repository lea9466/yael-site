import { z } from "zod";

import { CONTENT_STATUSES } from "@/types/content";
import {
  RECIPE_DESCRIPTION_MAX,
  RECIPE_DIFFICULTIES,
  RECIPE_REPEATER_LIMITS,
} from "@/lib/recipes/constants";
import {
  isReservedRecipeSlug,
  isValidRecipeSlug,
} from "@/lib/recipes/slug";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors };

export const RECIPES_PAGE_SIZE = 20;

export const RECIPE_STATUS_FILTERS = [
  "all",
  "draft",
  "published",
  "archived",
] as const;

export const RECIPE_FEATURED_FILTERS = ["all", "featured"] as const;

export const RECIPE_SORT_VALUES = [
  "newest",
  "oldest",
  "title",
  "updated",
] as const;

export type RecipeSortValue = (typeof RECIPE_SORT_VALUES)[number];
export type RecipeStatusFilter = (typeof RECIPE_STATUS_FILTERS)[number];
export type RecipeFeaturedFilter = (typeof RECIPE_FEATURED_FILTERS)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const ingredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "יש להזין שם רכיב")
    .max(120, "שם הרכיב ארוך מדי"),
  quantity: z
    .string()
    .trim()
    .max(40, "הכמות ארוכה מדי"),
  unit: z
    .string()
    .trim()
    .max(40, "יחידת המידה ארוכה מדי"),
});

const stepSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "יש להזין תיאור שלב")
    .max(2000, "תיאור השלב ארוך מדי"),
});

const galleryItemSchema = z.object({
  media_id: uuidSchema,
  order: z.number().int().min(0).max(RECIPE_REPEATER_LIMITS.gallery.max - 1),
});

const slugSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת מתכון")
  .max(120, "כתובת המתכון ארוכה מדי")
  .refine((value) => isValidRecipeSlug(value), {
    message: "כתובת המתכון יכולה להכיל אותיות באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedRecipeSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

const recipeSeoSchema = z.object({
  title: z.string().trim().max(70, "כותרת SEO ארוכה מדי"),
  description: z.string().trim().max(160, "תיאור SEO ארוך מדי"),
});

const recipeContentDraftSchema = z.object({
  ingredients: z
    .array(ingredientSchema)
    .max(RECIPE_REPEATER_LIMITS.ingredients.max),
  steps: z.array(stepSchema).max(RECIPE_REPEATER_LIMITS.steps.max),
  yael_tip: z
    .string()
    .trim()
    .max(2000, "הטיפ ארוך מדי")
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null)),
  gallery: z
    .array(galleryItemSchema)
    .max(
      RECIPE_REPEATER_LIMITS.gallery.max,
      `ניתן להוסיף עד ${RECIPE_REPEATER_LIMITS.gallery.max} תמונות לגלריה`
    ),
});

const recipeContentPublishSchema = recipeContentDraftSchema.extend({
  ingredients: z
    .array(ingredientSchema)
    .min(
      RECIPE_REPEATER_LIMITS.ingredients.min,
      `יש להוסיף לפחות ${RECIPE_REPEATER_LIMITS.ingredients.min} רכיב`
    )
    .max(RECIPE_REPEATER_LIMITS.ingredients.max),
  steps: z
    .array(stepSchema)
    .min(
      RECIPE_REPEATER_LIMITS.steps.min,
      `יש להוסיף לפחות ${RECIPE_REPEATER_LIMITS.steps.min} שלב`
    )
    .max(RECIPE_REPEATER_LIMITS.steps.max),
});

const recipeBaseFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "יש להזין לפחות 2 תווים בכותרת")
    .max(120, "הכותרת ארוכה מדי"),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .max(RECIPE_DESCRIPTION_MAX, "התיאור ארוך מדי"),
  cover_media_id: uuidSchema.nullable(),
  seo_og_media_id: uuidSchema.nullable(),
  category_id: z
    .string()
    .trim()
    .min(1, "יש לבחור קטגוריה")
    .uuid("יש לבחור קטגוריה תקינה"),
  duration_minutes: z.coerce
    .number()
    .int("משך ההכנה חייב להיות מספר שלם")
    .min(1, "משך ההכנה חייב להיות לפחות דקה אחת")
    .max(24 * 60, "משך ההכנה ארוך מדי"),
  servings: z.coerce
    .number()
    .int("מספר המנות חייב להיות מספר שלם")
    .min(1, "יש להזין לפחות מנה אחת")
    .max(100, "מספר המנות גבוה מדי"),
  difficulty: z.enum(RECIPE_DIFFICULTIES, {
    message: "יש לבחור רמת קושי",
  }),
  featured: z.boolean(),
  tag_ids: z.array(uuidSchema).max(30, "יותר מדי תגיות"),
  content: recipeContentDraftSchema,
  seo: recipeSeoSchema,
});

export const recipeDraftInputSchema = recipeBaseFieldsSchema.extend({
  status: z.enum(CONTENT_STATUSES).default("draft"),
});

export const recipePublishInputSchema = recipeBaseFieldsSchema.extend({
  status: z.literal("published"),
  description: z
    .string()
    .trim()
    .min(1, "יש להזין תיאור")
    .max(RECIPE_DESCRIPTION_MAX, "התיאור ארוך מדי"),
  cover_media_id: uuidSchema,
  content: recipeContentPublishSchema,
});

export const createRecipeSchema = recipeDraftInputSchema;
export const updateRecipeSchema = recipeDraftInputSchema.extend({
  id: uuidSchema,
});

export const publishRecipeSchema = recipePublishInputSchema.extend({
  id: uuidSchema,
});

export const listRecipesQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .default("")
    .transform((value) => value.trim().replace(/,/g, " "))
    .pipe(z.string().max(100, "חיפוש ארוך מדי")),
  status: z.enum(RECIPE_STATUS_FILTERS).optional().default("all"),
  featured: z.enum(RECIPE_FEATURED_FILTERS).optional().default("all"),
  category: z
    .string()
    .optional()
    .default("all")
    .transform((value) => (value === "all" ? "all" : value))
    .pipe(z.union([z.literal("all"), uuidSchema])),
  tag: z
    .string()
    .optional()
    .default("all")
    .transform((value) => (value === "all" ? "all" : value))
    .pipe(z.union([z.literal("all"), uuidSchema])),
  sort: z.enum(RECIPE_SORT_VALUES).optional().default("newest"),
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
});

export const recipeIdSchema = z.object({
  id: uuidSchema,
});

export const duplicateRecipeSchema = recipeIdSchema;
export const archiveRecipeSchema = recipeIdSchema;
export const permanentlyDeleteRecipeSchema = recipeIdSchema;

export type RecipeDraftInput = z.infer<typeof recipeDraftInputSchema>;
export type RecipePublishInput = z.infer<typeof recipePublishInputSchema>;
export type ListRecipesQuery = z.infer<typeof listRecipesQuerySchema>;
