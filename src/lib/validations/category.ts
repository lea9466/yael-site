import { z } from "zod";

import {
  CATEGORIES_PAGE_SIZE,
  CATEGORY_NAME_MAX,
  CATEGORY_SLUG_MAX,
  CATEGORY_TYPES,
} from "@/lib/categories/constants";
import {
  isReservedCategorySlug,
  isValidCategorySlug,
} from "@/lib/categories/slug";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors };

export const CATEGORY_TYPE_FILTERS = ["all", ...CATEGORY_TYPES] as const;

export const CATEGORY_SORT_VALUES = ["newest", "oldest", "name"] as const;

export type CategorySortValue = (typeof CATEGORY_SORT_VALUES)[number];
export type CategoryTypeFilter = (typeof CATEGORY_TYPE_FILTERS)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const categoryTypeSchema = z.enum(CATEGORY_TYPES, {
  message: "יש לבחור סוג קטגוריה",
});

const slugSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת קטגוריה")
  .max(CATEGORY_SLUG_MAX, "כתובת הקטגוריה ארוכה מדי")
  .refine((value) => isValidCategorySlug(value), {
    message: "כתובת הקטגוריה יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedCategorySlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "יש להזין שם קטגוריה")
    .max(CATEGORY_NAME_MAX, "שם הקטגוריה ארוך מדי"),
  slug: slugSchema,
  type: categoryTypeSchema,
  image_media_id: z
    .union([uuidSchema, z.null()])
    .optional()
    .transform((value) => value ?? null),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const createCategorySchema = categoryInputSchema;

export const updateCategorySchema = categoryInputSchema.extend({
  id: uuidSchema,
});

export const deleteCategorySchema = z.object({
  id: uuidSchema,
});

export const listCategoriesQuerySchema = z.object({
  q: z.string().trim().max(120).catch(""),
  type: z.enum(CATEGORY_TYPE_FILTERS).catch("all"),
  sort: z.enum(CATEGORY_SORT_VALUES).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export { CATEGORIES_PAGE_SIZE };
