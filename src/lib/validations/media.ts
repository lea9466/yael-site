import { z } from "zod";

const uuidSchema = z.string().uuid("מזהה הקובץ אינו תקין");

export const MEDIA_PAGE_SIZE = 24;

export const BULK_DELETE_MAX_IDS = 24;

export const MEDIA_SORT_VALUES = [
  "newest",
  "oldest",
  "filename",
  "size",
] as const;

export type MediaSortValue = (typeof MEDIA_SORT_VALUES)[number];

export const listMediaQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .default("")
    .transform((value) => value.trim().replace(/,/g, " "))
    .pipe(z.string().max(100, "חיפוש ארוך מדי")),
  sort: z.enum(MEDIA_SORT_VALUES).optional().default("newest"),
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
});

export const deleteMediaSchema = z.object({
  mediaId: uuidSchema,
});

export const uploadMediaSchema = z.object({
  altText: z
    .string()
    .trim()
    .max(200, "טקסט חלופי ארוך מדי")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const updateMediaAltTextSchema = z.object({
  mediaId: uuidSchema,
  altText: z
    .string()
    .trim()
    .max(250, "טקסט חלופי ארוך מדי")
    .transform((value) => (value.length > 0 ? value : null)),
});

export const bulkDeleteMediaSchema = z.object({
  mediaIds: z
    .array(uuidSchema)
    .min(1, "לא נבחרו קבצים למחיקה")
    .max(BULK_DELETE_MAX_IDS, "ניתן למחוק עד 24 פריטים בכל פעם")
    .transform((ids) => [...new Set(ids)]),
});

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type UpdateMediaAltTextInput = z.infer<typeof updateMediaAltTextSchema>;
export type BulkDeleteMediaInput = z.infer<typeof bulkDeleteMediaSchema>;
