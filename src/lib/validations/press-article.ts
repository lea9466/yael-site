import { z } from "zod";

import {
  PRESS_EXCERPT_MAX,
  PRESS_PAGE_SIZE,
  PRESS_PUBLICATION_NAME_MAX,
  PRESS_SEO_DESCRIPTION_MAX,
  PRESS_SEO_TITLE_MAX,
  PRESS_SLUG_MAX,
  PRESS_TITLE_MAX,
} from "@/lib/press/constants";
import {
  isReservedPressSlug,
  isValidPressSlug,
} from "@/lib/press/format";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors, PRESS_PAGE_SIZE };

export const PRESS_STATUS_FILTERS = ["all", "draft", "published"] as const;
export const PRESS_SORT_VALUES = [
  "display_order",
  "newest",
  "oldest",
  "title",
  "updated",
] as const;

export type PressStatusFilter = (typeof PRESS_STATUS_FILTERS)[number];
export type PressSortValue = (typeof PRESS_SORT_VALUES)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const optionalUuidSchema = z
  .string()
  .uuid("מזהה אינו תקין")
  .nullable()
  .optional()
  .transform((value) => value ?? null);

const slugDraftSchema = z
  .string()
  .trim()
  .max(PRESS_SLUG_MAX, "כתובת ארוכה מדי")
  .refine((value) => value.length === 0 || isValidPressSlug(value), {
    message:
      "כתובת יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => value.length === 0 || !isReservedPressSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

const slugPublishSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת")
  .max(PRESS_SLUG_MAX, "כתובת ארוכה מדי")
  .refine((value) => isValidPressSlug(value), {
    message:
      "כתובת יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedPressSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

const publishedAtSchema = z
  .string()
  .datetime({ offset: true, message: "תאריך פרסום אינו תקין" })
  .nullable();

export const pressArticleDraftInputSchema = z.object({
  title: z.string().trim().max(PRESS_TITLE_MAX, "כותרת ארוכה מדי"),
  slug: slugDraftSchema,
  excerpt: z
    .string()
    .trim()
    .max(PRESS_EXCERPT_MAX, "תיאור קצר ארוך מדי"),
  publication_name: z
    .string()
    .trim()
    .max(PRESS_PUBLICATION_NAME_MAX, "שם גוף התקשורת ארוך מדי"),
  published_at: publishedAtSchema,
  cover_media_id: optionalUuidSchema,
  pdf_media_id: optionalUuidSchema,
  display_order: z.coerce.number().int().min(0).max(10_000),
  status: z.literal("draft"),
  seo_title: z.string().trim().max(PRESS_SEO_TITLE_MAX, "כותרת SEO ארוכה מדי"),
  seo_description: z
    .string()
    .trim()
    .max(PRESS_SEO_DESCRIPTION_MAX, "תיאור SEO ארוך מדי"),
});

export const pressArticlePublishInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "יש להזין כותרת")
    .max(PRESS_TITLE_MAX, "כותרת ארוכה מדי"),
  slug: slugPublishSchema,
  excerpt: z
    .string()
    .trim()
    .max(PRESS_EXCERPT_MAX, "תיאור קצר ארוך מדי"),
  publication_name: z
    .string()
    .trim()
    .min(1, "יש להזין שם גוף תקשורת")
    .max(PRESS_PUBLICATION_NAME_MAX, "שם גוף התקשורת ארוך מדי"),
  published_at: z
    .string({ error: "יש לבחור תאריך פרסום" })
    .datetime({ offset: true, message: "תאריך פרסום אינו תקין" }),
  cover_media_id: optionalUuidSchema,
  pdf_media_id: uuidSchema,
  display_order: z.coerce.number().int().min(0).max(10_000),
  status: z.literal("published"),
  seo_title: z.string().trim().max(PRESS_SEO_TITLE_MAX, "כותרת SEO ארוכה מדי"),
  seo_description: z
    .string()
    .trim()
    .max(PRESS_SEO_DESCRIPTION_MAX, "תיאור SEO ארוך מדי"),
});

export const pressArticleInputSchema = z.discriminatedUnion("status", [
  pressArticleDraftInputSchema,
  pressArticlePublishInputSchema,
]);

export const createPressArticleSchema = pressArticleInputSchema;

export const updatePressArticleSchema = z.object({
  id: uuidSchema,
});

export const deletePressArticleSchema = z.object({
  id: uuidSchema,
});

export const listPressArticlesQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .default("")
    .transform((value) => value.trim().replace(/,/g, " "))
    .pipe(z.string().max(100, "חיפוש ארוך מדי")),
  status: z.enum(PRESS_STATUS_FILTERS).optional().default("all"),
  sort: z.enum(PRESS_SORT_VALUES).optional().default("display_order"),
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
});

export type PressArticleDraftInput = z.infer<typeof pressArticleDraftInputSchema>;
export type PressArticlePublishInput = z.infer<
  typeof pressArticlePublishInputSchema
>;
export type PressArticleInput = z.infer<typeof pressArticleInputSchema>;
export type ListPressArticlesQuery = z.infer<
  typeof listPressArticlesQuerySchema
>;
