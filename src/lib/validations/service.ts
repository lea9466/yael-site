import { z } from "zod";

import { CONTENT_STATUSES } from "@/types/content";
import { blockSchema } from "@/lib/validations/blocks";
import { normalizeServiceAudienceIcon } from "@/lib/services/audience-icons";
import {
  SERVICE_INTRO_BLOCKS_MAX,
  SERVICE_REPEATER_LIMITS,
} from "@/lib/services/constants";
import type {
  ServiceAudienceItem,
  ServiceFaqItem,
  ServiceIntroBlock,
  ServiceProcessStep,
  ServiceTextItem,
} from "@/lib/services/types";
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

const optionalUuidSchema = z
  .union([uuidSchema, z.literal(""), z.null()])
  .transform((value) => (value && value.length > 0 ? value : null));

const audienceItemSchema = z.object({
  text: z.string().trim().max(300, "הטקסט ארוך מדי"),
  icon: z.string().optional().nullable(),
});

const textItemSchema = z.object({
  text: z.string().trim().max(300, "הטקסט ארוך מדי"),
});

const processStepSchema = z.object({
  title: z.string().trim().max(120, "הכותרת ארוכה מדי"),
  description: z.string().trim().max(1000, "התיאור ארוך מדי"),
});

const faqItemSchema = z.object({
  question: z.string().trim().max(200, "השאלה ארוכה מדי"),
  answer: z.string().trim().max(2000, "התשובה ארוכה מדי"),
});

function filterAudienceItems(
  items: Array<{ text: string; icon?: string | null }>
): ServiceAudienceItem[] {
  return items.flatMap((item) => {
    const text = item.text.trim();

    if (!text) {
      return [];
    }

    const icon = normalizeServiceAudienceIcon(item.icon);

    return icon ? [{ text, icon }] : [{ text }];
  });
}

function filterTextItems(items: Array<{ text: string }>): ServiceTextItem[] {
  return items.flatMap((item) => {
    const text = item.text.trim();

    return text ? [{ text }] : [];
  });
}

function filterProcessSteps(
  items: Array<{ title: string; description: string }>
): ServiceProcessStep[] {
  return items.flatMap((item) => {
    const title = item.title.trim();
    const description = item.description.trim();

    if (!title && !description) {
      return [];
    }

    return [{ title, description }];
  });
}

function filterFaqItems(
  items: Array<{ question: string; answer: string }>
): ServiceFaqItem[] {
  return items.flatMap((item) => {
    const question = item.question.trim();
    const answer = item.answer.trim();

    if (!question && !answer) {
      return [];
    }

    return [{ question, answer }];
  });
}

const optionalSlugSchema = z
  .string()
  .trim()
  .max(120, "כתובת השירות ארוכה מדי")
  .refine((value) => value.length === 0 || isValidServiceSlug(value), {
    message:
      "כתובת השירות יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => value.length === 0 || !isReservedServiceSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

const requiredSlugSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת שירות")
  .max(120, "כתובת השירות ארוכה מדי")
  .refine((value) => isValidServiceSlug(value), {
    message:
      "כתובת השירות יכולה להכיל אותיות בעברית או באנגלית, מספרים ומקפים בלבד",
  })
  .refine((value) => !isReservedServiceSlug(value), {
    message: "כתובת זו שמורה למערכת",
  });

/** Drop image entries before validation — the service intro editor is text only. */
function stripImageBlocks(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.filter(
    (block) =>
      typeof block !== "object" ||
      block === null ||
      (block as { type?: unknown }).type !== "image"
  );
}

const serviceContentSchema = z.object({
  intro_blocks: z.preprocess(
    stripImageBlocks,
    z
      .array(blockSchema)
      .max(SERVICE_INTRO_BLOCKS_MAX, "יותר מדי בלוקים בהקדמה")
      .default([])
      .transform((blocks) => blocks as ServiceIntroBlock[])
  ),
  target_audience: z
    .array(audienceItemSchema)
    .max(SERVICE_REPEATER_LIMITS.target_audience.max)
    .transform(filterAudienceItems),
  audience_note_blocks: z.preprocess(
    stripImageBlocks,
    z
      .array(blockSchema)
      .max(SERVICE_INTRO_BLOCKS_MAX, "יותר מדי בלוקים בפסקה")
      .default([])
      .transform((blocks) => blocks as ServiceIntroBlock[])
  ),
  benefits: z
    .array(textItemSchema)
    .max(SERVICE_REPEATER_LIMITS.benefits.max)
    .transform(filterTextItems),
  process_steps: z
    .array(processStepSchema)
    .max(SERVICE_REPEATER_LIMITS.process_steps.max)
    .transform(filterProcessSteps),
  faq: z
    .array(faqItemSchema)
    .max(SERVICE_REPEATER_LIMITS.faq.max)
    .transform(filterFaqItems),
  cta_title: z.string().trim().max(120, "כותרת ההנעה ארוכה מדי"),
  cta_text: z.string().trim().max(500, "טקסט ההנעה ארוך מדי"),
  cta_button_label: z.string().trim().max(60, "תווית הכפתור ארוכה מדי"),
  cta_link_type: z.enum(["internal", "external"]),
  cta_link_url: z.string().trim().max(500, "הקישור ארוך מדי"),
});

function refineCtaLinkUrl(
  value: {
    content: {
      cta_link_type: "internal" | "external";
      cta_link_url: string;
    };
  },
  ctx: z.RefinementCtx
) {
  const url = value.content.cta_link_url.trim();

  if (!url) {
    return;
  }

  if (value.content.cta_link_type === "external") {
    if (!/^https?:\/\/.+/i.test(url)) {
      ctx.addIssue({
        code: "custom",
        message: "קישור חיצוני חייב להתחיל ב-http:// או https://",
        path: ["content", "cta_link_url"],
      });
    }

    return;
  }

  if (!url.startsWith("/")) {
    ctx.addIssue({
      code: "custom",
      message: "קישור פנימי חייב להתחיל ב-/",
      path: ["content", "cta_link_url"],
    });
  }
}

const serviceSeoSchema = z.object({
  title: z.string().trim().max(70, "כותרת SEO ארוכה מדי"),
  description: z.string().trim().max(160, "תיאור SEO ארוך מדי"),
});

const serviceSharedFieldsSchema = z.object({
  card_title: z
    .string()
    .trim()
    .max(120, "שם התצוגה בכרטיס ארוך מדי")
    .nullish()
    .transform((value) => value ?? ""),
  short_description: z
    .string()
    .max(2000, "התיאור הקצר ארוך מדי")
    .transform(normalizeMultilineText),
  // Derived plain-text mirror of `content.intro_blocks` (not edited directly).
  full_introduction: z.string().trim().max(60000, "ההקדמה ארוכה מדי"),
  cover_media_id: optionalUuidSchema,
  seo_og_media_id: optionalUuidSchema,
  featured: z.boolean(),
  content: serviceContentSchema,
  seo: serviceSeoSchema,
});

const serviceDraftObjectSchema = serviceSharedFieldsSchema.extend({
  title: z.string().trim().max(120, "הכותרת ארוכה מדי"),
  slug: optionalSlugSchema,
  status: z.enum(CONTENT_STATUSES).default("draft"),
});

const servicePublishObjectSchema = serviceSharedFieldsSchema.extend({
  title: z
    .string()
    .trim()
    .min(1, "יש להזין כותרת לפני פרסום")
    .max(120, "הכותרת ארוכה מדי"),
  slug: requiredSlugSchema,
  status: z.literal("published"),
});

export const serviceDraftInputSchema =
  serviceDraftObjectSchema.superRefine(refineCtaLinkUrl);

export const servicePublishInputSchema =
  servicePublishObjectSchema.superRefine(refineCtaLinkUrl);

export const createServiceSchema = serviceDraftInputSchema;

export const updateServiceSchema = serviceDraftObjectSchema
  .extend({
    id: uuidSchema,
  })
  .superRefine(refineCtaLinkUrl);

export const publishServiceSchema = servicePublishObjectSchema
  .extend({
    id: uuidSchema,
  })
  .superRefine(refineCtaLinkUrl);

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

/** Build a publish-shaped payload from a stored service for quick-publish checks. */
export function serviceRecordToPublishInput(service: {
  title: string;
  card_title: string | null;
  slug: string;
  short_description: string;
  full_introduction: string;
  cover_media_id: string | null;
  seo_og_media_id: string | null;
  featured: boolean;
  content: ServiceDraftInput["content"];
  seo: ServiceDraftInput["seo"];
}): ServicePublishInput {
  return {
    title: service.title,
    card_title: service.card_title ?? "",
    slug: service.slug,
    short_description: service.short_description,
    full_introduction: service.full_introduction,
    cover_media_id: service.cover_media_id,
    seo_og_media_id: service.seo_og_media_id,
    featured: service.featured,
    content: service.content,
    seo: service.seo,
    status: "published",
  };
}
