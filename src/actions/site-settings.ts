"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { SETTINGS_ERRORS } from "@/lib/settings/errors";
import {
  BUSINESS_PROFILE_SITE_CONTENT_KEY,
  SITE_SETTINGS_SITE_CONTENT_KEY,
} from "@/lib/settings/constants";
import { HOMEPAGE_SITE_CONTENT_KEY } from "@/lib/homepage/constants";
import { HOMEPAGE_ERRORS } from "@/lib/homepage/errors";
import { fetchHomepageSiteContent } from "@/lib/homepage/queries";
import {
  mergeHomepageHero,
  homepageDataSchema,
  type HomepageData,
} from "@/lib/validations/homepage-hero";
import { verifyMediaExists } from "@/lib/services/queries";
import {
  mapZodErrors,
  saveSiteSettingsInputSchema,
  type SaveSiteSettingsInput,
  type SettingsActionResult,
} from "@/lib/validations/site-settings";

async function getAdminSupabase(): Promise<{ supabase: SupabaseClient } | null> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const supabase = await createClient();

  return { supabase };
}

function revalidateSettingsPaths() {
  revalidatePath("/admin/settings");
}

async function validateMediaReference(
  mediaId: string | null,
  fieldKey: string
): Promise<SettingsActionResult | null> {
  if (!mediaId) {
    return null;
  }

  const exists = await verifyMediaExists(mediaId);

  if (!exists) {
    return {
      success: false,
      error: SETTINGS_ERRORS.invalidMedia,
      fieldErrors: { [fieldKey]: SETTINGS_ERRORS.invalidMedia },
    };
  }

  return null;
}

async function persistSiteContentRow(
  supabase: SupabaseClient,
  key: string,
  data:
    | SaveSiteSettingsInput["businessProfile"]
    | SaveSiteSettingsInput["siteSettings"]
    | HomepageData,
  expectedUpdatedAt: string
): Promise<{ success: true; updatedAt: string } | SettingsActionResult> {
  const { data: row, error } = await supabase
    .from("site_content")
    .update({ data })
    .eq("key", key)
    .eq("updated_at", expectedUpdatedAt)
    .select("updated_at")
    .maybeSingle();

  if (error) {
    return { success: false, error: SETTINGS_ERRORS.generic };
  }

  if (!row) {
    return { success: false, error: SETTINGS_ERRORS.conflict };
  }

  return { success: true, updatedAt: row.updated_at };
}

export async function saveSiteSettingsAction(
  input: unknown
): Promise<SettingsActionResult> {
  const parsed = saveSiteSettingsInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: SETTINGS_ERRORS.unauthorized };
  }

  const { businessProfile, siteSettings } = parsed.data;

  const mediaChecks = await Promise.all([
    validateMediaReference(businessProfile.logo_media_id, "logo_media_id"),
    validateMediaReference(businessProfile.favicon_media_id, "favicon_media_id"),
    validateMediaReference(
      siteSettings.default_seo.og_media_id,
      "default_seo.og_media_id"
    ),
    validateMediaReference(
      parsed.data.homepageHero.media_type === "image"
        ? parsed.data.homepageHero.media_id
        : null,
      "hero.media_id"
    ),
    validateMediaReference(
      parsed.data.homepageHero.media_type === "image"
        ? parsed.data.homepageHero.mobile_media_id
        : null,
      "hero.mobile_media_id"
    ),
  ]);

  const mediaError = mediaChecks.find((result) => result !== null);

  if (mediaError) {
    return mediaError;
  }

  const businessResult = await persistSiteContentRow(
    adminContext.supabase,
    BUSINESS_PROFILE_SITE_CONTENT_KEY,
    businessProfile,
    parsed.data.businessProfileUpdatedAt
  );

  if (!("updatedAt" in businessResult)) {
    return businessResult;
  }

  const settingsResult = await persistSiteContentRow(
    adminContext.supabase,
    SITE_SETTINGS_SITE_CONTENT_KEY,
    siteSettings,
    parsed.data.siteSettingsUpdatedAt
  );

  if (!("updatedAt" in settingsResult)) {
    return settingsResult;
  }

  const existingHomepage = await fetchHomepageSiteContent();

  if (!existingHomepage) {
    return { success: false, error: HOMEPAGE_ERRORS.generic };
  }

  const mergedHomepage = mergeHomepageHero(
    existingHomepage.data,
    parsed.data.homepageHero
  );
  const homepageValidation = homepageDataSchema.safeParse(mergedHomepage);

  if (!homepageValidation.success) {
    return {
      success: false,
      error: HOMEPAGE_ERRORS.invalidData,
      fieldErrors: mapZodErrors(homepageValidation.error),
    };
  }

  const homepageResult = await persistSiteContentRow(
    adminContext.supabase,
    HOMEPAGE_SITE_CONTENT_KEY,
    homepageValidation.data,
    parsed.data.homepageUpdatedAt
  );

  if (!("updatedAt" in homepageResult)) {
    return homepageResult;
  }

  revalidateSettingsPaths();

  return {
    success: true,
    data: {
      businessProfileUpdatedAt: businessResult.updatedAt,
      siteSettingsUpdatedAt: settingsResult.updatedAt,
      homepageUpdatedAt: homepageResult.updatedAt,
    },
  };
}
