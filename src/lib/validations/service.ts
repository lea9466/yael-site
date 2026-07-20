import { z } from "zod";

import { CONTENT_STATUSES } from "@/types/content";
import { SERVICE_REPEATER_LIMITS } from "@/lib/services/constants";
import {
  isReservedServiceSlug,
  isValidServiceSlug,
} from "@/lib/services/slug";
import { normalizeMultilineText } from "@/lib/text/multiline-text";

export const SERVICES_PAGE_SIZE = 20;

export const SERVICE_STATUS_FILTERS = [
  "all",
  "draft",
  "published",
  "archived",
] as const;

export const SERVICE_FEATURED_FILTERS = ["all", "featured"] as const;

export const SERVICE_SORT_VALUES = [
  "newest",
  "oldest",
  "title",
  "updated",
] as const;

export type ServiceSortValue = (typeof SERVICE_SORT_VALUES)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const textItemSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "יש להזין טקסט")
    .max(300, "הטקסט ארוך מדי"),
});

const processStepSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "יש להזין כותרת")
    .max(120, "הכותרת ארוכה מדי"),
  description: z
    .string()
    .trim()
    .min(1, "יש להזין תיאור")
    .max(1000, "התיאור ארוך מדי"),
});

const faqItemSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "יש להזין שאלה")
    .max(200, "השאלה ארוכה מדי"),
  answer: z
    .string()
    .trim()
    .min(1, "יש להזין תשובה")
    .max(2000, "התשובה ארוכה מדי"),
});

const slugSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת שירות")
  .max(120, "כתובת השירות ארוכה מדי")
  .refine((value) => isValidServiceSlug(value), {
    message: "כתובת השירות יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedServiceSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

const serviceContentDraftSchema = z.object({
  target_audience: z
    .array(textItemSchema)
    .max(SERVICE_REPEATER_LIMITS.target_audience.max),
  benefits: z.array(textItemSchema).max(SERVICE_REPEATER_LIMITS.benefits.max),
  process_steps: z
    .array(processStepSchema)
    .max(SERVICE_REPEATER_LIMITS.process_steps.max),
  faq: z.array(faqItemSchema).max(SERVICE_REPEATER_LIMITS.faq.max),
  cta_title: z.string().trim().max(120, "כותרת ההנעה ארוכה מדי"),
  cta_text: z.string().trim().max(500, "טקסט ההנעה ארוך מדי"),
  cta_button_label: z.string().trim().max(60, "תווית הכפתור ארוכה מדי"),
  cta_link_type: z.enum(["internal", "external"]),
  cta_link_url: z.string().trim().max(500, "הקישור ארוך מדי"),
});

const serviceContentPublishSchema = serviceContentDraftSchema.extend({
  target_audience: z
    .array(textItemSchema)
    .min(
      SERVICE_REPEATER_LIMITS.target_audience.min,
      `יש להוסיף לפחות ${SERVICE_REPEATER_LIMITS.target_audience.min} פריט`
    )
    .max(SERVICE_REPEATER_LIMITS.target_audience.max),
  benefits: z
    .array(textItemSchema)
    .min(
      SERVICE_REPEATER_LIMITS.benefits.min,
      `יש להוסיף לפחות ${SERVICE_REPEATER_LIMITS.benefits.min} יתרון`
    )
    .max(SERVICE_REPEATER_LIMITS.benefits.max),
  process_steps: z
    .array(processStepSchema)
    .min(
      SERVICE_REPEATER_LIMITS.process_steps.min,
      `יש להוסיף לפחות ${SERVICE_REPEATER_LIMITS.process_steps.min} שלב`
    )
    .max(SERVICE_REPEATER_LIMITS.process_steps.max),
  cta_title: z
    .string()
    .trim()
    .min(1, "יש להזין כותרת להנעה לפעולה")
    .max(120, "כותרת ההנעה ארוכה מדי"),
  cta_text: z
    .string()
    .trim()
    .min(1, "יש להזין טקסט להנעה לפעולה")
    .max(500, "טקסט ההנעה ארוך מדי"),
  cta_button_label: z
    .string()
    .trim()
    .min(1, "יש להזין תווית לכפתור")
    .max(60, "תווית הכפתור ארוכה מדי"),
  cta_link_url: z
    .string()
    .trim()
    .min(1, "יש להזין קישור")
    .max(500, "הקישור ארוך מדי"),
});

const serviceSeoSchema = z.object({
  title: z.string().trim().max(70, "כותרת SEO ארוכה מדי"),
  description: z.string().trim().max(160, "תיאור SEO ארוך מדי"),
});

const serviceBaseFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "יש להזין לפחות 2 תווים בכותרת")
    .max(120, "הכותרת ארוכה מדי"),
  slug: slugSchema,
  short_description: z
    .string()
    .max(300, "התיאור הקצר ארוך מדי")
    .transform(normalizeMultilineText)
    .pipe(z.string().min(1, "יש להזין תיאור קצר")),
  full_introduction: z
    .string()
    .trim()
    .min(1, "יש להזין הקדמה מלאה")
    .max(10000, "ההקדמה ארוכה מדי"),
  cover_media_id: uuidSchema.nullable(),
  seo_og_media_id: uuidSchema.nullable(),
  featured: z.boolean(),
  content: serviceContentDraftSchema,
  seo: serviceSeoSchema,
});

export const serviceDraftInputSchema = serviceBaseFieldsSchema.extend({
  status: z.enum(CONTENT_STATUSES).default("draft"),
});

export const servicePublishInputSchema = serviceBaseFieldsSchema
  .extend({
    status: z.literal("published"),
    content: serviceContentPublishSchema,
    cover_media_id: uuidSchema,
  })
  .superRefine((value, ctx) => {
    if (value.content.cta_link_type === "external") {
      if (!/^https?:\/\/.+/i.test(value.content.cta_link_url)) {
        ctx.addIssue({
          code: "custom",
          message: "קישור חיצוני חייב להתחיל ב-http:// או https://",
          path: ["content", "cta_link_url"],
        });
      }
    } else if (!value.content.cta_link_url.startsWith("/")) {
      ctx.addIssue({
        code: "custom",
        message: "קישור פנימי חייב להתחיל ב-/",
        path: ["content", "cta_link_url"],
      });
    }
  });

export const createServiceSchema = serviceDraftInputSchema;
export const updateServiceSchema = serviceDraftInputSchema.extend({
  id: uuidSchema,
});

export const publishServiceSchema = servicePublishInputSchema.extend({
  id: uuidSchema,
});

export const listServicesQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .default("")
    .transform((value) => value.trim().replace(/,/g, " "))
    .pipe(z.string().max(100, "חיפוש ארוך מדי")),
  status: z.enum(SERVICE_STATUS_FILTERS).optional().default("all"),
  featured: z.enum(SERVICE_FEATURED_FILTERS).optional().default("all"),
  sort: z.enum(SERVICE_SORT_VALUES).optional().default("newest"),
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
});

export const serviceIdSchema = z.object({
  id: uuidSchema,
});

export const duplicateServiceSchema = serviceIdSchema;

export const archiveServiceSchema = serviceIdSchema;

export const quickPublishServiceSchema = serviceIdSchema;
export const unpublishServiceSchema = serviceIdSchema;

export const restoreServiceSchema = z.object({
  id: uuidSchema,
  publish: z.boolean().default(false),
});

export const permanentlyDeleteServiceSchema = serviceIdSchema;

export type ServiceDraftInput = z.infer<typeof serviceDraftInputSchema>;
export type ServicePublishInput = z.infer<typeof servicePublishInputSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;

export function mapZodErrors(
  error: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");

    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  return fieldErrors;
}
