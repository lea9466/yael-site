import { z } from "zod";

import {
  TAGS_PAGE_SIZE,
  TAG_NAME_MAX,
  TAG_SLUG_MAX,
  TAG_TYPES,
} from "@/lib/tags/constants";
import { isReservedTagSlug, isValidTagSlug } from "@/lib/tags/slug";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors };

export const TAG_TYPE_FILTERS = ["all", ...TAG_TYPES] as const;

export const TAG_SORT_VALUES = ["newest", "oldest", "name"] as const;

export type TagSortValue = (typeof TAG_SORT_VALUES)[number];
export type TagTypeFilter = (typeof TAG_TYPE_FILTERS)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const tagTypeSchema = z.enum(TAG_TYPES, {
  message: "יש לבחור סוג תגית",
});

const slugSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת תגית")
  .max(TAG_SLUG_MAX, "כתובת התגית ארוכה מדי")
  .refine((value) => isValidTagSlug(value), {
    message: "כתובת התגית יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedTagSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

export const tagInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "יש להזין לפחות 2 תווים בשם התגית")
    .max(TAG_NAME_MAX, "שם התגית ארוך מדי"),
  slug: slugSchema,
  type: tagTypeSchema,
});

export type TagInput = z.infer<typeof tagInputSchema>;

export const createTagSchema = tagInputSchema;

export const updateTagSchema = tagInputSchema.extend({
  id: uuidSchema,
});

export const deleteTagSchema = z.object({
  id: uuidSchema,
});

export const listTagsQuerySchema = z.object({
  q: z.string().trim().max(120).catch(""),
  type: z.enum(TAG_TYPE_FILTERS).catch("all"),
  sort: z.enum(TAG_SORT_VALUES).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;

export { TAGS_PAGE_SIZE };
