import { z } from "zod";

import { ARTICLE_REPEATER_LIMITS } from "@/lib/articles/constants";

/**
 * Shared Zod schemas for the rich-text block model used by posts, the About
 * page and the service introduction. Kept in its own module so both
 * `validations/article.ts` and `validations/service.ts` can import it without a
 * circular dependency.
 */

const blockUuidSchema = z.string().uuid("מזהה אינו תקין");

export const textMarkSchema = z.object({
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

export const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string().trim().max(12000, "הפסקה ארוכה מדי"),
    marks: z.array(textMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string().trim().max(240, "כותרת ארוכה מדי"),
    marks: z.array(textMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().trim().max(4000, "ציטוט ארוך מדי"),
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
    media_id: blockUuidSchema,
    caption: z
      .string()
      .trim()
      .max(500, "כיתוב ארוך מדי")
      .nullable()
      .transform((value) => (value && value.length > 0 ? value : null)),
  }),
]);
