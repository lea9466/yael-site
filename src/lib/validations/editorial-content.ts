import { z } from "zod";

import { isValidArticleLinkUrl } from "@/lib/articles/link-validation";
import { ARTICLE_REPEATER_LIMITS } from "@/lib/articles/constants";

const uuidSchema = z.string().uuid("מזהה אינו תקין");

export const editorialTextMarkSchema = z.object({
  type: z.enum(["bold", "italic", "link"]),
  start: z.number().int().min(0),
  end: z.number().int().min(1),
  href: z.string().trim().max(2048).optional(),
});

export const editorialListItemSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "יש להזין טקסט לפריט")
    .max(4000, "טקסט הפריט ארוך מדי"),
  marks: z.array(editorialTextMarkSchema).optional(),
});

export const editorialBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string().trim().max(12000, "הפסקה ארוכה מדי"),
    marks: z.array(editorialTextMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string().trim().max(240, "כותרת ארוכה מדי"),
    marks: z.array(editorialTextMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().trim().max(4000, "ציטוט ארוך מדי"),
    marks: z.array(editorialTextMarkSchema).optional(),
  }),
  z.object({
    type: z.literal("list"),
    list_type: z.enum(["bullet", "ordered"]),
    items: z
      .array(editorialListItemSchema)
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

export const editorialGalleryItemSchema = z.object({
  media_id: uuidSchema,
  order: z
    .number()
    .int()
    .min(0)
    .max(ARTICLE_REPEATER_LIMITS.gallery.max - 1),
});

export const editorialContentSchema = z
  .object({
    blocks: z
      .array(editorialBlockSchema)
      .max(ARTICLE_REPEATER_LIMITS.blocks.max, "יותר מדי בלוקי תוכן"),
    gallery: z
      .array(editorialGalleryItemSchema)
      .max(
        ARTICLE_REPEATER_LIMITS.gallery.max,
        `ניתן להוסיף עד ${ARTICLE_REPEATER_LIMITS.gallery.max} תמונות לגלריה`
      ),
  })
  .strict();

export const editorialContentRequiredSchema = editorialContentSchema.extend({
  blocks: z
    .array(editorialBlockSchema)
    .min(1, "יש להוסיף לפחות בלוק תוכן אחד")
    .max(ARTICLE_REPEATER_LIMITS.blocks.max),
});

export type EditorialContent = z.infer<typeof editorialContentSchema>;

function validateMarksInContent(
  content: EditorialContent,
  context: z.RefinementCtx
): void {
  const validateMarks = (
    marks: z.infer<typeof editorialTextMarkSchema>[] | undefined,
    path: (string | number)[]
  ) => {
    if (!marks) {
      return;
    }

    for (const [index, mark] of marks.entries()) {
      if (mark.type === "link") {
        if (!mark.href || !isValidArticleLinkUrl(mark.href)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "כתובת הקישור אינה תקינה",
            path: [...path, index, "href"],
          });
        }
      }
    }
  };

  for (const [blockIndex, block] of content.blocks.entries()) {
    switch (block.type) {
      case "paragraph":
      case "heading":
      case "quote":
        validateMarks(block.marks, ["blocks", blockIndex, "marks"]);
        break;
      case "list":
        for (const [itemIndex, item] of block.items.entries()) {
          validateMarks(item.marks, [
            "blocks",
            blockIndex,
            "items",
            itemIndex,
            "marks",
          ]);
        }
        break;
      default:
        break;
    }
  }
}

export function refineEditorialContentLinks<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, context) => {
    validateMarksInContent(value as EditorialContent, context);
  });
}
