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
import { normalizeMultilineText } from "@/lib/text/multiline-text";

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
  text: z
    .string()
    .trim()
    .min(1, "יש להזין רכיב")
    .max(200, "שורת הרכיב ארוכה מדי"),
});

const stepSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "יש להזין תיאור שלב")
    .max(2000, "תיאור השלב ארוך מדי"),
});

const recipeSectionSchema = z
  .object({
    title: z.string().trim().max(80, "שם החלק ארוך מדי"),
    ingredients: z
      .array(ingredientSchema)
      .max(RECIPE_REPEATER_LIMITS.ingredients.max),
    steps: z.array(stepSchema).max(RECIPE_REPEATER_LIMITS.steps.max),
  })
  .superRefine((section, ctx) => {
    if (section.ingredients.length === 0 && section.steps.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש להוסיף לפחות רכיב אחד או שלב הכנה אחד בחלק זה",
        path: ["ingredients"],
      });
    }
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
    message: "כתובת המתכון יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedRecipeSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

const recipeSeoSchema = z.object({
  title: z.string().trim().max(70, "כותרת SEO ארוכה מדי"),
  description: z.string().trim().max(160, "תיאור SEO ארוך מדי"),
});

function withSectionTitleRules<T extends z.ZodType>(schema: T) {
  return schema.superRefine((value, ctx) => {
    const content = value as {
      recipe_sections?: Array<{ title?: string }>;
    };
    const sections = content.recipe_sections ?? [];

    if (sections.length <= 1) {
      return;
    }

    sections.forEach((section, index) => {
      const title =
        typeof section.title === "string" ? section.title.trim() : "";

      if (!title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "במתכון עם כמה חלקים יש להזין שם לכל חלק",
          path: ["recipe_sections", index, "title"],
        });
      }
    });
  });
}

const recipeContentDraftSchema = withSectionTitleRules(
  z.object({
    recipe_sections: z
      .array(recipeSectionSchema)
      .max(
        RECIPE_REPEATER_LIMITS.sections.max,
        `ניתן להוסיף עד ${RECIPE_REPEATER_LIMITS.sections.max} חלקים`
      ),
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
  })
);

const recipeContentPublishSchema = withSectionTitleRules(
  z.object({
    recipe_sections: z
      .array(recipeSectionSchema)
      .min(
        RECIPE_REPEATER_LIMITS.sections.min,
        "יש להוסיף לפחות חלק אחד עם רכיבים או שלבי הכנה"
      )
      .max(
        RECIPE_REPEATER_LIMITS.sections.max,
        `ניתן להוסיף עד ${RECIPE_REPEATER_LIMITS.sections.max} חלקים`
      ),
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
  })
);

const recipeBaseFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "יש להזין לפחות 2 תווים בכותרת")
    .max(120, "הכותרת ארוכה מדי"),
  slug: slugSchema,
  description: z
    .string()
    .max(RECIPE_DESCRIPTION_MAX, "התיאור ארוך מדי")
    .transform(normalizeMultilineText),
  cover_media_id: uuidSchema.nullable(),
  seo_og_media_id: uuidSchema.nullable(),
  category_id: z
    .string()
    .trim()
    .min(1, "יש לבחור קטגוריה")
    .uuid("יש לבחור קטגוריה תקינה"),
  prep_duration: z
    .string()
    .trim()
    .min(1, "יש להזין משך הכנה")
    .max(120, "משך ההכנה ארוך מדי"),
  servings: z
    .string()
    .trim()
    .max(120, "תיאור המנות ארוך מדי"),
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
    .max(RECIPE_DESCRIPTION_MAX, "התיאור ארוך מדי")
    .transform(normalizeMultilineText)
    .pipe(z.string().min(1, "יש להזין תיאור")),
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
export const quickPublishRecipeSchema = recipeIdSchema;
export const unpublishRecipeSchema = recipeIdSchema;
export const permanentlyDeleteRecipeSchema = recipeIdSchema;

export type RecipeDraftInput = z.infer<typeof recipeDraftInputSchema>;
export type RecipePublishInput = z.infer<typeof recipePublishInputSchema>;
export type ListRecipesQuery = z.infer<typeof listRecipesQuerySchema>;
