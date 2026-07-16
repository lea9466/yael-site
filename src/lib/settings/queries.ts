import { createClient } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { HOMEPAGE_SITE_CONTENT_KEY } from "@/lib/homepage/constants";
import { normalizeHomepageData } from "@/lib/validations/homepage-hero";
import {
  BUSINESS_PROFILE_SITE_CONTENT_KEY,
  SITE_SETTINGS_SITE_CONTENT_KEY,
} from "@/lib/settings/constants";
import {
  normalizeBusinessProfile,
  normalizeSiteSettings,
  type SettingsMediaPreview,
  type SettingsPageData,
} from "@/lib/validations/site-settings";

type SiteContentRow = {
  data: unknown;
  updated_at: string;
};

const MEDIA_SELECT_COLUMNS =
  "id, storage_path, file_name, original_file_name, alt_text";

async function fetchMediaPreviewsByIds(
  mediaIds: Array<string | null>
): Promise<Map<string, SettingsMediaPreview>> {
  const uniqueIds = [...new Set(mediaIds.filter((id): id is string => Boolean(id)))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .select(MEDIA_SELECT_COLUMNS)
    .in("id", uniqueIds);

  if (error || !data) {
    return new Map();
  }

  const previews = new Map<string, SettingsMediaPreview>();

  for (const row of data) {
    const url = getPublicMediaUrl(row.storage_path);

    previews.set(row.id, {
      id: row.id,
      url: url ?? "",
      alt: row.alt_text ?? row.original_file_name ?? row.file_name,
    });
  }

  return previews;
}

export async function fetchSettingsPageData(): Promise<SettingsPageData | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("key, data, updated_at")
      .in("key", [
        BUSINESS_PROFILE_SITE_CONTENT_KEY,
        SITE_SETTINGS_SITE_CONTENT_KEY,
        HOMEPAGE_SITE_CONTENT_KEY,
      ]);

    if (error || !data) {
      return null;
    }

    const businessRow = data.find(
      (row) => row.key === BUSINESS_PROFILE_SITE_CONTENT_KEY
    ) as (SiteContentRow & { key: string }) | undefined;
    const settingsRow = data.find(
      (row) => row.key === SITE_SETTINGS_SITE_CONTENT_KEY
    ) as (SiteContentRow & { key: string }) | undefined;
    const homepageRow = data.find(
      (row) => row.key === HOMEPAGE_SITE_CONTENT_KEY
    ) as (SiteContentRow & { key: string }) | undefined;

    if (!businessRow || !settingsRow || !homepageRow) {
      return null;
    }

    const businessProfile = normalizeBusinessProfile(businessRow.data);
    const siteSettings = normalizeSiteSettings(settingsRow.data);
    const homepage = normalizeHomepageData(homepageRow.data);

    const previews = await fetchMediaPreviewsByIds([
      businessProfile.logo_media_id,
      businessProfile.favicon_media_id,
      siteSettings.default_seo.og_media_id,
      homepage.hero.media_id,
    ]);

    return {
      businessProfile,
      siteSettings,
      homepageHero: homepage.hero,
      businessProfileUpdatedAt: businessRow.updated_at,
      siteSettingsUpdatedAt: settingsRow.updated_at,
      homepageUpdatedAt: homepageRow.updated_at,
      mediaPreviews: {
        logo: businessProfile.logo_media_id
          ? previews.get(businessProfile.logo_media_id) ?? null
          : null,
        favicon: businessProfile.favicon_media_id
          ? previews.get(businessProfile.favicon_media_id) ?? null
          : null,
        ogImage: siteSettings.default_seo.og_media_id
          ? previews.get(siteSettings.default_seo.og_media_id) ?? null
          : null,
        heroImage: homepage.hero.media_id
          ? previews.get(homepage.hero.media_id) ?? null
          : null,
      },
    };
  } catch {
    return null;
  }
}
