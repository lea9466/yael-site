import { z } from "zod";

const uuidSchema = z.string().uuid("מזהה הקובץ אינו תקין");

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

export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
