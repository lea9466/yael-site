import { z } from "zod";

import {
  CERTIFICATE_DESCRIPTION_MAX,
  CERTIFICATE_ORGANIZATION_MAX,
  CERTIFICATE_TITLE_MAX,
  CERTIFICATE_YEAR_MAX,
  CERTIFICATE_YEAR_MIN,
} from "@/lib/certificates/constants";
import { mapZodErrors } from "@/lib/validations/service";
import { normalizeMultilineText } from "@/lib/text/multiline-text";

export { mapZodErrors };

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const certificateYearSchema = z
  .union([
    z
      .number()
      .int("יש להזין שנת הסמכה שלמה")
      .min(CERTIFICATE_YEAR_MIN, `השנה חייבת להיות בין ${CERTIFICATE_YEAR_MIN} ל-${CERTIFICATE_YEAR_MAX}`)
      .max(CERTIFICATE_YEAR_MAX, `השנה חייבת להיות בין ${CERTIFICATE_YEAR_MIN} ל-${CERTIFICATE_YEAR_MAX}`),
    z.null(),
  ])
  .optional();

export const certificateItemSchema = z
  .object({
    id: z.string().min(1, "מזהה תעודה חסר"),
    title: z
      .string()
      .trim()
      .min(1, "יש להזין כותרת")
      .max(CERTIFICATE_TITLE_MAX, "הכותרת ארוכה מדי"),
    organization: z
      .string()
      .trim()
      .min(1, "יש להזין ארגון מעניק")
      .max(CERTIFICATE_ORGANIZATION_MAX, "שם הארגון ארוך מדי"),
    year: certificateYearSchema,
    media_id: uuidSchema,
    description: z
      .union([
        z.string().max(CERTIFICATE_DESCRIPTION_MAX, "התיאור ארוך מדי"),
        z.null(),
      ])
      .optional(),
    order: z.number().int().min(0, "סדר תצוגה אינו תקין"),
  })
  .strict();

export type CertificateItem = z.infer<typeof certificateItemSchema>;

export const certificatesDataSchema = z
  .object({
    items: z.array(certificateItemSchema),
  })
  .strict();

export type CertificatesData = z.infer<typeof certificatesDataSchema>;

const certificateYearInputSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^\d{4}$/.test(value),
    "יש להזין שנת הסמכה בת ארבע ספרות"
  )
  .refine((value) => {
    if (value.length === 0) {
      return true;
    }

    const year = Number.parseInt(value, 10);

    return year >= CERTIFICATE_YEAR_MIN && year <= CERTIFICATE_YEAR_MAX;
  }, `השנה חייבת להיות בין ${CERTIFICATE_YEAR_MIN} ל-${CERTIFICATE_YEAR_MAX}`);

export const certificateFormInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "יש להזין כותרת")
    .max(CERTIFICATE_TITLE_MAX, "הכותרת ארוכה מדי"),
  organization: z
    .string()
    .trim()
    .min(1, "יש להזין ארגון מעניק")
    .max(CERTIFICATE_ORGANIZATION_MAX, "שם הארגון ארוך מדי"),
  year: certificateYearInputSchema,
  media_id: uuidSchema,
  description: z
    .string()
    .max(CERTIFICATE_DESCRIPTION_MAX, "התיאור ארוך מדי")
    .transform(normalizeMultilineText),
});

export type CertificateFormInput = z.infer<typeof certificateFormInputSchema>;

export const addCertificateSchema = certificateFormInputSchema.extend({
  updatedAt: z.string().datetime({ offset: true }),
});

export const updateCertificateSchema = certificateFormInputSchema.extend({
  id: z.string().min(1, "מזהה תעודה חסר"),
  updatedAt: z.string().datetime({ offset: true }),
});

export const duplicateCertificateSchema = z.object({
  id: z.string().min(1, "מזהה תעודה חסר"),
  updatedAt: z.string().datetime({ offset: true }),
});

export const deleteCertificateSchema = z.object({
  id: z.string().min(1, "מזהה תעודה חסר"),
  updatedAt: z.string().datetime({ offset: true }),
});

export const reorderCertificatesSchema = z.object({
  orderedIds: z
    .array(z.string().min(1))
    .min(1, "יש לספק רשימת תעודות לסידור"),
  updatedAt: z.string().datetime({ offset: true }),
});

export function formInputToCertificateFields(
  input: CertificateFormInput
): Pick<
  CertificateItem,
  "title" | "organization" | "year" | "media_id" | "description"
> {
  const trimmedYear = input.year.trim();

  const normalizedDescription = normalizeMultilineText(input.description);

  return {
    title: input.title.trim(),
    organization: input.organization.trim(),
    year: trimmedYear.length > 0 ? Number.parseInt(trimmedYear, 10) : null,
    media_id: input.media_id,
    description:
      normalizedDescription.length > 0 ? normalizedDescription : null,
  };
}
