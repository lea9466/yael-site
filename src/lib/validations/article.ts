import { z } from "zod";

import { CONTENT_STATUSES } from "@/types/content";
import {
  ARTICLE_BODY_MAX,
  ARTICLE_REPEATER_LIMITS,
} from "@/lib/articles/constants";
import {
  isReservedArticleSlug,
  isValidArticleSlug,
} from "@/lib/articles/slug";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors };

export const ARTICLES_PAGE_SIZE = 20;

export const ARTICLE_STATUS_FILTERS = [
  "all",
  "draft",
  "published",
  "archived",
] as const;

export const ARTICLE_FEATURED_FILTERS = ["all", "featured"] as const;

export const ARTICLE_SORT_VALUES = [
  "newest",
  "oldest",
  "title",
  "updated",
] as const;

export type ArticleSortValue = (typeof ARTICLE_SORT_VALUES)[number];
export type ArticleStatusFilter = (typeof ARTICLE_STATUS_FILTERS)[number];
export type ArticleFeaturedFilter = (typeof ARTICLE_FEATURED_FILTERS)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const textMarkSchema = z.object({
  type: z.enum(["bold", "italic", "link"]),
  start: z.number().int().min(0),
  end: z.number().int().min(1),
  href: z.string().trim().max(2048).optional(),
});

const listItemSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "יש להזין טקסט לפריט")
    .max(4000, "טקסט הפריט ארוך מדי"),
  marks: z.array(textMarkSchema).optional(),
});

const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z
      .string()
      .trim()
      .max(12000, "הפסקה ארוכה מדי"),
    marks: z.array(textMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z
      .string()
      .trim()
      .max(240, "כותרת ארוכה מדי"),
    marks: z.array(textMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("quote"),
    text: z
      .string()
      .trim()
      .max(4000, "ציטוט ארוך מדי"),
    marks: z.array(textMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("list"),
    list_type: z.enum(["bullet", "ordered"]),
    items: z
      .array(listItemSchema)
      .max(
        ARTICLE_REPEATER_LIMITS.listItems.max,
        `ניתן להוסיף עד ${ARTICLE_REPEATER_LIMITS.listItems.max} פריטים לרשימה`
      ),
  }),
  z.object({
    type: z.literal("image"),
    media_id: uuidSchema,
    caption: z
      .string()
      .trim()
      .max(500, "כיתוב ארוך מדי")
      .nullable()
      .transform((value) => (value && value.length > 0 ? value : null)),
  }),
]);

const galleryItemSchema = z.object({
  media_id: uuidSchema,
  order: z
    .number()
    .int()
    .min(0)
    .max(ARTICLE_REPEATER_LIMITS.gallery.max - 1),
});

const slugSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת פוסט")
  .max(120, "כתובת הפוסט ארוכה מדי")
  .refine((value) => isValidArticleSlug(value), {
    message: "כתובת הפוסט יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedArticleSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

const articleSeoSchema = z.object({
  title: z.string().trim().max(70, "כותרת SEO ארוכה מדי"),
  description: z.string().trim().max(160, "תיאור SEO ארוך מדי"),
});

const articleContentDraftSchema = z.object({
  blocks: z
    .array(blockSchema)
    .max(
      ARTICLE_REPEATER_LIMITS.blocks.max,
      "יותר מדי בלוקי תוכן"
    ),
  gallery: z
    .array(galleryItemSchema)
    .max(
      ARTICLE_REPEATER_LIMITS.gallery.max,
      `ניתן להוסיף עד ${ARTICLE_REPEATER_LIMITS.gallery.max} תמונות לגלריה`
    ),
});

const articleContentPublishSchema = articleContentDraftSchema.extend({
  blocks: z
    .array(blockSchema)
    .min(1, "יש להוסיף לפחות בלוק תוכן אחד")
    .max(ARTICLE_REPEATER_LIMITS.blocks.max),
});

const articleBaseFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "יש להזין לפחות 2 תווים בכותרת")
    .max(120, "הכותרת ארוכה מדי"),
  slug: slugSchema,
  cover_media_id: uuidSchema.nullable(),
  seo_og_media_id: uuidSchema.nullable(),
  category_id: z
    .string()
    .trim()
    .min(1, "יש לבחור קטגוריה")
    .uuid("יש לבחור קטגוריה תקינה"),
  featured: z.boolean(),
  tag_ids: z.array(uuidSchema).max(30, "יותר מדי תגיות"),
  content: articleContentDraftSchema,
  seo: articleSeoSchema,
});

export const articleDraftInputSchema = articleBaseFieldsSchema.extend({
  status: z.enum(CONTENT_STATUSES).default("draft"),
});

export const articlePublishInputSchema = articleBaseFieldsSchema.extend({
  status: z.literal("published"),
  cover_media_id: uuidSchema,
  content: articleContentPublishSchema,
});

export const createArticleSchema = articleDraftInputSchema;
export const updateArticleSchema = articleDraftInputSchema.extend({
  id: uuidSchema,
});

export const publishArticleSchema = articlePublishInputSchema.extend({
  id: uuidSchema,
});

export const listArticlesQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .default("")
    .transform((value) => value.trim().replace(/,/g, " "))
    .pipe(z.string().max(100, "חיפוש ארוך מדי")),
  status: z.enum(ARTICLE_STATUS_FILTERS).optional().default("all"),
  featured: z.enum(ARTICLE_FEATURED_FILTERS).optional().default("all"),
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
  sort: z.enum(ARTICLE_SORT_VALUES).optional().default("newest"),
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
});

export const articleIdSchema = z.object({
  id: uuidSchema,
});

export const duplicateArticleSchema = articleIdSchema;
export const archiveArticleSchema = articleIdSchema;
export const permanentlyDeleteArticleSchema = articleIdSchema;

export type ArticleDraftInput = z.infer<typeof articleDraftInputSchema>;
export type ArticlePublishInput = z.infer<typeof articlePublishInputSchema>;
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;

export const ARTICLE_BODY_SCHEMA = z
  .string()
  .trim()
  .max(ARTICLE_BODY_MAX, "תוכן הפוסט ארוך מדי");
