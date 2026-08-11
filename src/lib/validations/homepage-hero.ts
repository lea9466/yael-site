import { z } from "zod";

import { isValidArticleLinkUrl } from "@/lib/articles/link-validation";
import {
  HOMEPAGE_HERO_BUTTON_LABEL_MAX,
  HOMEPAGE_HERO_BUTTON_URL_MAX,
  HOMEPAGE_HERO_EXTERNAL_URL_MAX,
  HOMEPAGE_HERO_MEDIA_TYPES,
  HOMEPAGE_HERO_SUBTITLE_MAX,
  HOMEPAGE_HERO_TITLE_MAX,
  HOMEPAGE_SHORT_ABOUT_TEXT_MAX,
  HOMEPAGE_SHORT_ABOUT_TITLE_MAX,
} from "@/lib/homepage/constants";
import { getDefaultHomepageData } from "@/lib/homepage/defaults";
import { normalizeMultilineText } from "@/lib/text/multiline-text";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors };

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const unsafeUrlProtocols = /^(javascript|data|file):/i;

function isSafeExternalUrl(value: string): boolean {
  const trimmed = value.trim();

  if (unsafeUrlProtocols.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);

    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const buttonUrlSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת לכפתור")
  .max(HOMEPAGE_HERO_BUTTON_URL_MAX, "כתובת הכפתור ארוכה מדי")
  .refine((value) => isValidArticleLinkUrl(value), {
    message: "כתובת הכפתור אינה תקינה",
  });

const externalMediaUrlSchema = z
  .string()
  .trim()
  .min(1, "יש להזין כתובת")
  .max(HOMEPAGE_HERO_EXTERNAL_URL_MAX, "הכתובת ארוכה מדי")
  .refine((value) => isSafeExternalUrl(value), {
    message: "כתובת חיצונית אינה תקינה",
  });

const homepageButtonSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "יש להזין תווית לכפתור")
      .max(HOMEPAGE_HERO_BUTTON_LABEL_MAX, "תווית הכפתור ארוכה מדי"),
    url: buttonUrlSchema,
  })
  .strict();

const optionalSecondaryButtonSchema = z
  .object({
    label: z.string().trim().max(HOMEPAGE_HERO_BUTTON_LABEL_MAX, "תווית הכפתור ארוכה מדי"),
    url: z.string().trim().max(HOMEPAGE_HERO_BUTTON_URL_MAX, "כתובת הכפתור ארוכה מדי"),
  })
  .strict()
  .nullable()
  .transform((value) => {
    if (!value || value.label.length === 0 || value.url.length === 0) {
      return null;
    }

    return value;
  })
  .superRefine((value, context) => {
    if (!value) {
      return;
    }

    if (!isValidArticleLinkUrl(value.url)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש להזין כתובת תקינה לכפתור המשני",
        path: ["url"],
      });
    }
  });

export const homepageHeroSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "יש להזין כותרת ראשית")
      .max(HOMEPAGE_HERO_TITLE_MAX, "הכותרת ארוכה מדי"),
    subtitle: z
      .string()
      .trim()
      .min(1, "יש להזין כותרת משנה")
      .max(HOMEPAGE_HERO_SUBTITLE_MAX, "כותרת המשנה ארוכה מדי"),
    primary_button: homepageButtonSchema,
    secondary_button: optionalSecondaryButtonSchema,
    background_media_id: z.union([uuidSchema, z.null()]),
    background_mobile_media_id: z.union([uuidSchema, z.null()]),
    side_media_type: z.enum(HOMEPAGE_HERO_MEDIA_TYPES, {
      message: "סוג מדיה לא תקין",
    }),
    side_media_id: z.union([uuidSchema, z.null()]),
    side_video_url: z.union([externalMediaUrlSchema, z.null()]),
    side_animation_url: z.union([externalMediaUrlSchema, z.null()]),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.background_media_id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש לבחור תמונת רקע מהספרייה",
        path: ["background_media_id"],
      });
    }

    if (value.side_media_type === "image" && !value.side_media_id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש לבחור תמונה מהספרייה",
        path: ["side_media_id"],
      });
    }

    if (value.side_media_type === "video_url" && !value.side_media_id && !value.side_video_url) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש לבחור סרטון מהספרייה או להזין כתובת וידאו חיצונית",
        path: ["side_media_id"],
      });
    }

    if (value.side_media_type === "animation_url" && !value.side_animation_url) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "יש להזין כתובת אנימציה חיצונית",
        path: ["side_animation_url"],
      });
    }
  });

export type HomepageHeroData = z.infer<typeof homepageHeroSchema>;

const titleTextSchema = z
  .object({
    title: z.string().trim().min(1, "יש להזין כותרת"),
    text: z.string().trim().min(1, "יש להזין טקסט"),
  })
  .strict();

export const shortAboutSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "יש להזין כותרת אודות לדף הבית")
      .max(HOMEPAGE_SHORT_ABOUT_TITLE_MAX, "כותרת האודות בדף הבית ארוכה מדי"),
    text: z
      .string()
      .transform((value) => normalizeMultilineText(value))
      .pipe(
        z
          .string()
          .min(1, "יש להזין טקסט אודות לדף הבית")
          .max(HOMEPAGE_SHORT_ABOUT_TEXT_MAX, "טקסט האודות בדף הבית ארוך מדי")
      ),
  })
  .strict();

export type HomepageShortAbout = z.infer<typeof shortAboutSchema>;

const contactCtaSchema = z
  .object({
    title: z.string().trim().min(1, "יש להזין כותרת"),
    text: z.string().trim().min(1, "יש להזין טקסט"),
    button_label: z.string().trim().min(1, "יש להזין תווית לכפתור"),
  })
  .strict();

export const homepageDataSchema = z
  .object({
    hero: homepageHeroSchema,
    short_about: shortAboutSchema,
    approach: titleTextSchema,
    contact_cta: contactCtaSchema,
  })
  .strict();

export type HomepageData = z.infer<typeof homepageDataSchema>;

export const saveHomepageHeroInputSchema = z.object({
  hero: homepageHeroSchema,
  homepageUpdatedAt: z.string().datetime({ offset: true }),
});

export type SaveHomepageHeroInput = z.infer<typeof saveHomepageHeroInputSchema>;

export type HomepageHeroActionResult =
  | {
      success: true;
      data: {
        homepageUpdatedAt: string;
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

function normalizeHeroMediaType(value: unknown): HomepageHeroData["side_media_type"] {
  if (value === "video") {
    return "video_url";
  }

  if (
    value === "image" ||
    value === "video_url" ||
    value === "animation_url"
  ) {
    return value;
  }

  return "image";
}

function normalizeHero(raw: unknown): HomepageHeroData {
  const defaults = getDefaultHomepageData().hero;

  if (!isRecord(raw)) {
    return defaults;
  }

  const primaryButton = isRecord(raw.primary_button) ? raw.primary_button : {};
  const secondaryButton = isRecord(raw.secondary_button)
    ? raw.secondary_button
    : null;

  const merged = {
    title: typeof raw.title === "string" ? raw.title : defaults.title,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : defaults.subtitle,
    primary_button: {
      label:
        typeof primaryButton.label === "string"
          ? primaryButton.label
          : defaults.primary_button.label,
      url:
        typeof primaryButton.url === "string"
          ? primaryButton.url
          : defaults.primary_button.url,
    },
    secondary_button:
      secondaryButton &&
      typeof secondaryButton.label === "string" &&
      secondaryButton.label.trim().length > 0 &&
      typeof secondaryButton.url === "string" &&
      secondaryButton.url.trim().length > 0
        ? {
            label: secondaryButton.label,
            url: secondaryButton.url,
          }
        : null,
    background_media_id:
      typeof raw.background_media_id === "string"
        ? raw.background_media_id
        : raw.background_media_id === null
          ? null
          : (typeof raw.media_id === "string" ? raw.media_id : null), // Fallback to old field
    background_mobile_media_id:
      typeof raw.background_mobile_media_id === "string"
        ? raw.background_mobile_media_id
        : raw.background_mobile_media_id === null || raw.background_mobile_media_id === undefined
          ? null
          : (typeof raw.mobile_media_id === "string" ? raw.mobile_media_id : null), // Fallback to old field
    side_media_type: normalizeHeroMediaType(raw.side_media_type),
    side_media_id:
      typeof raw.side_media_id === "string"
        ? raw.side_media_id
        : raw.side_media_id === null
          ? null
          : defaults.side_media_id,
    side_video_url:
      typeof raw.side_video_url === "string"
        ? raw.side_video_url
        : raw.side_video_url === null
          ? null
          : defaults.side_video_url,
    side_animation_url:
      typeof raw.side_animation_url === "string"
        ? raw.side_animation_url
        : raw.side_animation_url === null
          ? null
          : (defaults.side_animation_url ?? null),
  };

  const parsed = homepageHeroSchema.safeParse(merged);

  if (parsed.success) {
    return parsed.data;
  }

  return defaults;
}

function normalizeTitleText(
  raw: unknown,
  fallback: { title: string; text: string }
): { title: string; text: string } {
  if (!isRecord(raw)) {
    return fallback;
  }

  return {
    title: typeof raw.title === "string" ? raw.title : fallback.title,
    text: typeof raw.text === "string" ? raw.text : fallback.text,
  };
}

export function normalizeHomepageData(raw: unknown): HomepageData {
  const defaults = getDefaultHomepageData();

  if (!isRecord(raw)) {
    return defaults;
  }

  const contactCtaRaw = isRecord(raw.contact_cta) ? raw.contact_cta : null;

  const merged: HomepageData = {
    hero: normalizeHero(raw.hero),
    short_about: normalizeTitleText(raw.short_about, defaults.short_about),
    approach: normalizeTitleText(raw.approach, defaults.approach),
    contact_cta: {
      title:
        contactCtaRaw && typeof contactCtaRaw.title === "string"
          ? contactCtaRaw.title
          : defaults.contact_cta.title,
      text:
        contactCtaRaw && typeof contactCtaRaw.text === "string"
          ? contactCtaRaw.text
          : defaults.contact_cta.text,
      button_label:
        contactCtaRaw && typeof contactCtaRaw.button_label === "string"
          ? contactCtaRaw.button_label
          : defaults.contact_cta.button_label,
    },
  };

  const parsed = homepageDataSchema.safeParse(merged);

  if (parsed.success) {
    return parsed.data;
  }

  return defaults;
}

export type HomepageHeroFormState = {
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryButtonLabel: string;
  heroPrimaryButtonUrl: string;
  heroSecondaryButtonLabel: string;
  heroSecondaryButtonUrl: string;
  heroBackgroundMediaId: string | null;
  heroBackgroundMobileMediaId: string | null;
  heroSideMediaType: HomepageHeroData["side_media_type"];
  heroSideMediaId: string | null;
  heroSideVideoUrl: string;
  heroSideAnimationUrl: string;
};

export function homepageHeroToFormState(hero: HomepageHeroData): HomepageHeroFormState {
  return {
    heroTitle: hero.title,
    heroSubtitle: hero.subtitle,
    heroPrimaryButtonLabel: hero.primary_button.label,
    heroPrimaryButtonUrl: hero.primary_button.url,
    heroSecondaryButtonLabel: hero.secondary_button?.label ?? "",
    heroSecondaryButtonUrl: hero.secondary_button?.url ?? "",
    heroBackgroundMediaId: hero.background_media_id,
    heroBackgroundMobileMediaId: hero.background_mobile_media_id,
    heroSideMediaType: hero.side_media_type,
    heroSideMediaId: hero.side_media_id,
    heroSideVideoUrl: hero.side_video_url ?? "",
    heroSideAnimationUrl: hero.side_animation_url ?? "",
  };
}

export function formStateToHomepageHero(state: HomepageHeroFormState): HomepageHeroData {
  return homepageHeroSchema.parse({
    title: state.heroTitle,
    subtitle: state.heroSubtitle,
    primary_button: {
      label: state.heroPrimaryButtonLabel,
      url: state.heroPrimaryButtonUrl,
    },
    secondary_button:
      state.heroSecondaryButtonLabel.trim().length > 0 &&
      state.heroSecondaryButtonUrl.trim().length > 0
        ? {
            label: state.heroSecondaryButtonLabel,
            url: state.heroSecondaryButtonUrl,
          }
        : null,
    background_media_id: state.heroBackgroundMediaId,
    background_mobile_media_id: state.heroBackgroundMobileMediaId,
    side_media_type: state.heroSideMediaType,
    side_media_id: state.heroSideMediaId,
    side_video_url: state.heroSideVideoUrl || null,
    side_animation_url: state.heroSideAnimationUrl || null,
  });
}

export function mergeHomepageHero(
  existing: HomepageData,
  hero: HomepageHeroData
): HomepageData {
  return homepageDataSchema.parse({
    ...existing,
    hero,
  });
}

export function mergeHomepageHeroAndShortAbout(
  existing: HomepageData,
  hero: HomepageHeroData,
  shortAbout: HomepageShortAbout
): HomepageData {
  return homepageDataSchema.parse({
    ...existing,
    hero,
    short_about: shortAbout,
  });
}

export type HomepageShortAboutFormState = {
  shortAboutTitle: string;
  shortAboutText: string;
};

export function homepageShortAboutToFormState(
  shortAbout: HomepageShortAbout
): HomepageShortAboutFormState {
  return {
    shortAboutTitle: shortAbout.title,
    shortAboutText: shortAbout.text,
  };
}

export function formStateToHomepageShortAbout(
  state: HomepageShortAboutFormState
): HomepageShortAbout {
  return shortAboutSchema.parse({
    title: state.shortAboutTitle,
    text: state.shortAboutText,
  });
}
