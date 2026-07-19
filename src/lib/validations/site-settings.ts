import { z } from "zod";

import {
  getDefaultBusinessProfile,
  getDefaultSiteSettings,
} from "@/lib/settings/defaults";
import {
  ADDRESS_MAX,
  ANALYTICS_ID_MAX,
  CITY_MAX,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  SHORT_DESCRIPTION_MAX,
  SITE_NAME_MAX,
  TAGLINE_MAX,
  VERIFICATION_CODE_MAX,
  WEEKDAYS,
} from "@/lib/settings/constants";
import {
  homepageHeroSchema,
  homepageHeroToFormState,
  formStateToHomepageHero,
  type HomepageHeroData,
} from "@/lib/validations/homepage-hero";
import { mapZodErrors } from "@/lib/validations/service";
import { normalizeOptionalMultilineText } from "@/lib/text/multiline-text";

export { mapZodErrors };

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const weekdayValues = WEEKDAYS.map((day) => day.value) as [
  (typeof WEEKDAYS)[number]["value"],
  ...(typeof WEEKDAYS)[number]["value"][],
];

const optionalMultilineNullableString = (max: number, message: string) =>
  z
    .union([z.string().max(max, message), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) {
        return null;
      }

      return normalizeOptionalMultilineText(value);
    });

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

const optionalUrlSchema = z
  .union([
    z.literal(""),
    z.null(),
    z.string().trim().url("כתובת אינה תקינה"),
  ])
  .transform((value) => {
    if (value === "" || value === null) {
      return null;
    }

    return value;
  });

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.string().email().safeParse(value).success,
    "כתובת האימייל אינה תקינה"
  );

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (value.length === 0) {
      return true;
    }

    const digits = value.replace(/\D/g, "");

    return digits.length >= 9 && digits.length <= 15;
  }, "מספר הטלפון אינו תקין");

const workingHoursEntrySchema = z
  .object({
    day: z.enum(weekdayValues, { message: "יום לא תקין" }),
    opens: z.string().trim().min(1, "יש להזין שעת פתיחה").max(10, "שעה ארוכה מדי"),
    closes: z.string().trim().min(1, "יש להזין שעת סגירה").max(10, "שעה ארוכה מדי"),
  })
  .strict();

const socialLinksSchema = z
  .object({
    instagram: optionalUrlSchema,
    facebook: optionalUrlSchema,
    whatsapp: z
      .union([
        z.literal(""),
        z.null(),
        z.string().trim().max(500, "הערך ארוך מדי"),
      ])
      .transform((value) => {
        if (value === "" || value === null) {
          return null;
        }

        return value;
      }),
    youtube: optionalUrlSchema,
    tiktok: optionalUrlSchema,
    linkedin: optionalUrlSchema,
    pinterest: optionalUrlSchema,
  })
  .strict();

export const businessProfileDataSchema = z
  .object({
    business_name: z
      .string()
      .trim()
      .min(1, "יש להזין שם אתר")
      .max(SITE_NAME_MAX, "שם האתר ארוך מדי"),
    legal_name: optionalNullableString(120, "שם משפטי ארוך מדי"),
    registration_number: optionalNullableString(60, "מספר רישום ארוך מדי"),
    email: optionalEmailSchema,
    phone: optionalPhoneSchema,
    address: optionalNullableString(ADDRESS_MAX, "הכתובת ארוכה מדי"),
    city: optionalNullableString(CITY_MAX, "שם העיר ארוך מדי"),
    tagline: optionalNullableString(TAGLINE_MAX, "הסלוגן ארוך מדי"),
    short_description: optionalMultilineNullableString(
      SHORT_DESCRIPTION_MAX,
      "התיאור ארוך מדי"
    ),
    working_hours: z.array(workingHoursEntrySchema),
    social: socialLinksSchema,
    logo_media_id: z.union([uuidSchema, z.null()]),
    favicon_media_id: z.union([uuidSchema, z.null()]),
  })
  .strict();

export type BusinessProfileData = z.infer<typeof businessProfileDataSchema>;

export const siteSettingsDataSchema = z
  .object({
    default_seo: z
      .object({
        title: z
          .string()
          .trim()
          .min(1, "יש להזין כותרת SEO ברירת מחדל")
          .max(SEO_TITLE_MAX, "כותרת SEO ארוכה מדי"),
        description: z
          .string()
          .trim()
          .min(1, "יש להזין תיאור מטא ברירת מחדל")
          .max(SEO_DESCRIPTION_MAX, "תיאור המטא ארוך מדי"),
        og_media_id: z.union([uuidSchema, z.null()]),
      })
      .strict(),
    ga4_measurement_id: optionalNullableString(
      ANALYTICS_ID_MAX,
      "מזהה Analytics ארוך מדי"
    ),
    gtm_container_id: optionalNullableString(
      ANALYTICS_ID_MAX,
      "מזהה GTM ארוך מדי"
    ),
    meta_pixel_id: optionalNullableString(
      ANALYTICS_ID_MAX,
      "מזהה Meta Pixel ארוך מדי"
    ),
    google_site_verification: optionalNullableString(
      VERIFICATION_CODE_MAX,
      "קוד אימות ארוך מדי"
    ),
    robots_indexing_enabled: z.boolean(),
    maintenance_mode: z.boolean(),
  })
  .strict();

export type SiteSettingsData = z.infer<typeof siteSettingsDataSchema>;

export const saveSiteSettingsInputSchema = z.object({
  businessProfile: businessProfileDataSchema,
  siteSettings: siteSettingsDataSchema,
  homepageHero: homepageHeroSchema,
  businessProfileUpdatedAt: z.string().datetime({ offset: true }),
  siteSettingsUpdatedAt: z.string().datetime({ offset: true }),
  homepageUpdatedAt: z.string().datetime({ offset: true }),
});

export type SaveSiteSettingsInput = z.infer<typeof saveSiteSettingsInputSchema>;

export type SettingsActionResult =
  | {
      success: true;
      data: {
        businessProfileUpdatedAt: string;
        siteSettingsUpdatedAt: string;
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

export function normalizeBusinessProfile(raw: unknown): BusinessProfileData {
  const defaults = getDefaultBusinessProfile();

  if (!isRecord(raw)) {
    return defaults;
  }

  const socialRaw = isRecord(raw.social) ? raw.social : {};

  const merged = {
    ...defaults,
    ...raw,
    working_hours: Array.isArray(raw.working_hours) ? raw.working_hours : [],
    social: {
      ...defaults.social,
      ...socialRaw,
    },
  };

  const parsed = businessProfileDataSchema.safeParse(merged);

  if (parsed.success) {
    return parsed.data;
  }

  return defaults;
}

export function normalizeSiteSettings(raw: unknown): SiteSettingsData {
  const defaults = getDefaultSiteSettings();

  if (!isRecord(raw)) {
    return defaults;
  }

  const defaultSeoRaw = isRecord(raw.default_seo) ? raw.default_seo : {};

  const merged = {
    ...defaults,
    ...raw,
    default_seo: {
      ...defaults.default_seo,
      ...defaultSeoRaw,
    },
  };

  const parsed = siteSettingsDataSchema.safeParse(merged);

  if (parsed.success) {
    return parsed.data;
  }

  return defaults;
}

export function formStateToBusinessProfile(input: {
  businessName: string;
  tagline: string;
  shortDescription: string;
  logoMediaId: string | null;
  faviconMediaId: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  workingHours: BusinessProfileData["working_hours"];
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
  socialTiktok: string;
  socialLinkedin: string;
  socialPinterest: string;
}): BusinessProfileData {
  return businessProfileDataSchema.parse({
    business_name: input.businessName,
    legal_name: null,
    registration_number: null,
    email: input.email,
    phone: input.phone,
    address: input.address || null,
    city: input.city || null,
    tagline: input.tagline || null,
    short_description: input.shortDescription || null,
    working_hours: input.workingHours,
    social: {
      instagram: input.socialInstagram || null,
      facebook: input.socialFacebook || null,
      whatsapp: input.whatsapp || null,
      youtube: input.socialYoutube || null,
      tiktok: input.socialTiktok || null,
      linkedin: input.socialLinkedin || null,
      pinterest: input.socialPinterest || null,
    },
    logo_media_id: input.logoMediaId,
    favicon_media_id: input.faviconMediaId,
  });
}

export function formStateToSiteSettings(input: {
  seoTitle: string;
  seoDescription: string;
  ogMediaId: string | null;
  robotsIndexingEnabled: boolean;
  maintenanceMode: boolean;
  ga4MeasurementId: string;
  gtmContainerId: string;
  metaPixelId: string;
  googleSiteVerification: string;
}): SiteSettingsData {
  return siteSettingsDataSchema.parse({
    default_seo: {
      title: input.seoTitle,
      description: input.seoDescription,
      og_media_id: input.ogMediaId,
    },
    ga4_measurement_id: input.ga4MeasurementId || null,
    gtm_container_id: input.gtmContainerId || null,
    meta_pixel_id: input.metaPixelId || null,
    google_site_verification: input.googleSiteVerification || null,
    robots_indexing_enabled: input.robotsIndexingEnabled,
    maintenance_mode: input.maintenanceMode,
  });
}

export type SettingsMediaPreview = {
  id: string;
  url: string;
  alt: string;
  mimeType?: string;
  sizeBytes?: number;
};

export type SettingsPageData = {
  businessProfile: BusinessProfileData;
  siteSettings: SiteSettingsData;
  homepageHero: HomepageHeroData;
  businessProfileUpdatedAt: string;
  siteSettingsUpdatedAt: string;
  homepageUpdatedAt: string;
  mediaPreviews: {
    logo: SettingsMediaPreview | null;
    favicon: SettingsMediaPreview | null;
    ogImage: SettingsMediaPreview | null;
    heroImage: SettingsMediaPreview | null;
    heroMobileImage: SettingsMediaPreview | null;
  };
};

export type SettingsFormState = {
  businessName: string;
  tagline: string;
  shortDescription: string;
  logoMediaId: string | null;
  faviconMediaId: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  workingHours: BusinessProfileData["working_hours"];
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
  socialTiktok: string;
  socialLinkedin: string;
  socialPinterest: string;
  seoTitle: string;
  seoDescription: string;
  ogMediaId: string | null;
  robotsIndexingEnabled: boolean;
  maintenanceMode: boolean;
  ga4MeasurementId: string;
  gtmContainerId: string;
  metaPixelId: string;
  googleSiteVerification: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryButtonLabel: string;
  heroPrimaryButtonUrl: string;
  heroSecondaryButtonLabel: string;
  heroSecondaryButtonUrl: string;
  heroMediaType: HomepageHeroData["media_type"];
  heroMediaId: string | null;
  heroMobileMediaId: string | null;
  heroVideoUrl: string;
  heroAnimationUrl: string;
};

export function pageDataToFormState(data: SettingsPageData): SettingsFormState {
  const { businessProfile, siteSettings } = data;
  const heroState = homepageHeroToFormState(data.homepageHero);

  return {
    businessName: businessProfile.business_name,
    tagline: businessProfile.tagline ?? "",
    shortDescription: businessProfile.short_description ?? "",
    logoMediaId: businessProfile.logo_media_id,
    faviconMediaId: businessProfile.favicon_media_id,
    phone: businessProfile.phone,
    whatsapp: businessProfile.social.whatsapp ?? "",
    email: businessProfile.email,
    address: businessProfile.address ?? "",
    city: businessProfile.city ?? "",
    workingHours: businessProfile.working_hours,
    socialInstagram: businessProfile.social.instagram ?? "",
    socialFacebook: businessProfile.social.facebook ?? "",
    socialYoutube: businessProfile.social.youtube ?? "",
    socialTiktok: businessProfile.social.tiktok ?? "",
    socialLinkedin: businessProfile.social.linkedin ?? "",
    socialPinterest: businessProfile.social.pinterest ?? "",
    seoTitle: siteSettings.default_seo.title,
    seoDescription: siteSettings.default_seo.description,
    ogMediaId: siteSettings.default_seo.og_media_id,
    robotsIndexingEnabled: siteSettings.robots_indexing_enabled,
    maintenanceMode: siteSettings.maintenance_mode,
    ga4MeasurementId: siteSettings.ga4_measurement_id ?? "",
    gtmContainerId: siteSettings.gtm_container_id ?? "",
    metaPixelId: siteSettings.meta_pixel_id ?? "",
    googleSiteVerification: siteSettings.google_site_verification ?? "",
    ...heroState,
  };
}

export function formStateToSavePayload(
  state: SettingsFormState,
  timestamps: {
    businessProfileUpdatedAt: string;
    siteSettingsUpdatedAt: string;
    homepageUpdatedAt: string;
  }
): SaveSiteSettingsInput {
  return {
    businessProfile: formStateToBusinessProfile(state),
    siteSettings: formStateToSiteSettings(state),
    homepageHero: formStateToHomepageHero(state),
    businessProfileUpdatedAt: timestamps.businessProfileUpdatedAt,
    siteSettingsUpdatedAt: timestamps.siteSettingsUpdatedAt,
    homepageUpdatedAt: timestamps.homepageUpdatedAt,
  };
}

export function serializeFormState(state: SettingsFormState): string {
  return JSON.stringify(state);
}
