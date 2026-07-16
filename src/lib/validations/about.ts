import { z } from "zod";

import { isValidArticleLinkUrl } from "@/lib/articles/link-validation";
import {
  normalizeArticleContent,
  toArticleContentForSave,
} from "@/lib/articles/content";
import type { ArticleContent } from "@/lib/articles/types";
import {
  ABOUT_CTA_BUTTON_LABEL_MAX,
  ABOUT_CTA_BUTTON_URL_MAX,
  ABOUT_CTA_TEXT_MAX,
  ABOUT_CTA_TITLE_MAX,
  ABOUT_PAGE_TITLE_MAX,
  ABOUT_SUBTITLE_MAX,
} from "@/lib/about/constants";
import { getDefaultAboutPageData } from "@/lib/about/defaults";
import {
  editorialContentRequiredSchema,
  refineEditorialContentLinks,
} from "@/lib/validations/editorial-content";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors };

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const optionalNullableString = (max: number, message: string) =>
  z
    .union([z.string().max(max, message), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) {
        return null;
      }

      const trimmed = value.trim();

      return trimmed.length === 0 ? null : trimmed;
    });

const aboutCtaSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "יש להזין כותרת להנעה לפעולה")
      .max(ABOUT_CTA_TITLE_MAX, "כותרת ההנעה לפעולה ארוכה מדי"),
    text: z
      .string()
      .trim()
      .min(1, "יש להזין טקסט להנעה לפעולה")
      .max(ABOUT_CTA_TEXT_MAX, "טקסט ההנעה לפעולה ארוך מדי"),
    button_label: z
      .string()
      .trim()
      .min(1, "יש להזין תווית לכפתור")
      .max(ABOUT_CTA_BUTTON_LABEL_MAX, "תווית הכפתור ארוכה מדי"),
    button_url: z
      .string()
      .trim()
      .min(1, "יש להזין כתובת לכפתור")
      .max(ABOUT_CTA_BUTTON_URL_MAX, "כתובת הכפתור ארוכה מדי")
      .refine((value) => isValidArticleLinkUrl(value), {
        message: "כתובת הכפתור אינה תקינה",
      }),
  })
  .strict();

const aboutContentSchema = refineEditorialContentLinks(
  editorialContentRequiredSchema
);

export const aboutPageDataSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "יש להזין כותרת עמוד")
      .max(ABOUT_PAGE_TITLE_MAX, "כותרת העמוד ארוכה מדי"),
    intro_text: optionalNullableString(ABOUT_SUBTITLE_MAX, "כותרת המשנה ארוכה מדי"),
    content: aboutContentSchema,
    cover_media_id: z.union([uuidSchema, z.null()]),
    cta: aboutCtaSchema,
    seo: z
      .object({
        title: z.string().trim().max(70).optional(),
        description: z.string().trim().max(160).optional(),
        canonical_url: z.string().trim().max(2048).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type AboutPageData = z.infer<typeof aboutPageDataSchema>;

export const saveAboutPageInputSchema = z.object({
  data: aboutPageDataSchema,
  updatedAt: z.string().datetime({ offset: true }),
});

export type SaveAboutPageInput = z.infer<typeof saveAboutPageInputSchema>;

export type AboutActionResult =
  | {
      success: true;
      data: {
        updatedAt: string;
      };
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAboutContent(raw: unknown): ArticleContent {
  if (typeof raw === "string") {
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return { blocks: [], gallery: [] };
    }

    return {
      blocks: [{ type: "paragraph", text: trimmed }],
      gallery: [],
    };
  }

  return normalizeArticleContent(raw);
}

function normalizeCta(raw: unknown): AboutPageData["cta"] {
  const defaults = getDefaultAboutPageData().cta;

  if (!isRecord(raw)) {
    return defaults;
  }

  return {
    title: typeof raw.title === "string" ? raw.title : defaults.title,
    text: typeof raw.text === "string" ? raw.text : defaults.text,
    button_label:
      typeof raw.button_label === "string"
        ? raw.button_label
        : defaults.button_label,
    button_url:
      typeof raw.button_url === "string" ? raw.button_url : defaults.button_url,
  };
}

export function normalizeAboutPageData(raw: unknown): AboutPageData {
  const defaults = getDefaultAboutPageData();

  if (!isRecord(raw)) {
    return defaults;
  }

  const merged = {
    title: typeof raw.title === "string" ? raw.title : defaults.title,
    intro_text:
      typeof raw.intro_text === "string"
        ? raw.intro_text
        : raw.intro_text === null
          ? null
          : defaults.intro_text,
    content: normalizeAboutContent(raw.content),
    cover_media_id:
      typeof raw.cover_media_id === "string"
        ? raw.cover_media_id
        : raw.cover_media_id === null
          ? null
          : defaults.cover_media_id,
    cta: normalizeCta(raw.cta),
    seo: isRecord(raw.seo) ? raw.seo : defaults.seo,
  };

  const parsed = aboutPageDataSchema.safeParse(merged);

  if (parsed.success) {
    return parsed.data;
  }

  return defaults;
}

export function toAboutPageDataForSave(data: AboutPageData): AboutPageData {
  return aboutPageDataSchema.parse({
    ...data,
    content: toArticleContentForSave(data.content),
  });
}

export type AboutFormState = {
  title: string;
  subtitle: string;
  coverMediaId: string | null;
  ctaTitle: string;
  ctaText: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
};

export function aboutPageDataToFormState(data: AboutPageData): AboutFormState {
  return {
    title: data.title,
    subtitle: data.intro_text ?? "",
    coverMediaId: data.cover_media_id,
    ctaTitle: data.cta.title,
    ctaText: data.cta.text,
    ctaButtonLabel: data.cta.button_label,
    ctaButtonUrl: data.cta.button_url,
  };
}

export function formStateToAboutPageData(
  state: AboutFormState,
  content: ArticleContent
): AboutPageData {
  return aboutPageDataSchema.parse({
    title: state.title,
    intro_text: state.subtitle || null,
    cover_media_id: state.coverMediaId,
    content,
    cta: {
      title: state.ctaTitle,
      text: state.ctaText,
      button_label: state.ctaButtonLabel,
      button_url: state.ctaButtonUrl,
    },
  });
}

export function collectAboutContentMediaIds(content: ArticleContent): string[] {
  const blockMediaIds = content.blocks
    .filter((block) => block.type === "image")
    .map((block) => block.media_id);

  return [...blockMediaIds, ...content.gallery.map((item) => item.media_id)];
}
