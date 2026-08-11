import { createClient } from "@/lib/auth/session";
import { MEDIA_LIBRARY_SELECT_COLUMNS } from "@/lib/media/constants";
import type { UploadProfile } from "@/lib/media/constants";
import type { MediaRecord } from "@/lib/media/media-types";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { HOMEPAGE_SITE_CONTENT_KEY } from "@/lib/homepage/constants";
import {
  normalizeHomepageData,
  type HomepageData,
  type HomepageHeroData,
} from "@/lib/validations/homepage-hero";

export type HomepageHeroMediaPreview = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  mimeType: string;
  uploadProfile: UploadProfile;
};

export type HomepageHeroPageData = {
  homepage: HomepageData;
  hero: HomepageHeroData;
  homepageUpdatedAt: string;
  heroDesktopMediaPreview: HomepageHeroMediaPreview | null;
  heroMobileMediaPreview: HomepageHeroMediaPreview | null;
  heroSideMediaPreview: HomepageHeroMediaPreview | null;
};

async function fetchHeroMediaPreview(
  mediaId: string | null
): Promise<HomepageHeroMediaPreview | null> {
  if (!mediaId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .select(MEDIA_LIBRARY_SELECT_COLUMNS)
    .eq("id", mediaId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const url = getPublicMediaUrl(data.storage_path);
  const record = data as MediaRecord;

  return {
    id: record.id,
    url: url ?? "",
    alt: record.alt_text ?? record.original_file_name ?? record.file_name,
    width: record.width,
    height: record.height,
    mimeType: record.mime_type,
    uploadProfile: record.upload_mode,
  };
}

export async function fetchHomepageSiteContent(): Promise<{
  data: HomepageData;
  updatedAt: string;
} | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data, updated_at")
      .eq("key", HOMEPAGE_SITE_CONTENT_KEY)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      data: normalizeHomepageData(data.data),
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

export async function getHomepageContent(): Promise<HomepageData | null> {
  const row = await fetchHomepageSiteContent();

  return row?.data ?? null;
}

export async function fetchHomepageHeroPageData(): Promise<HomepageHeroPageData | null> {
  const row = await fetchHomepageSiteContent();

  if (!row) {
    return null;
  }

  const [heroDesktopMediaPreview, heroMobileMediaPreview, heroSideMediaPreview] = await Promise.all([
    fetchHeroMediaPreview(row.data.hero.background_media_id),
    fetchHeroMediaPreview(row.data.hero.background_mobile_media_id),
    fetchHeroMediaPreview(row.data.hero.side_media_id),
  ]);

  return {
    homepage: row.data,
    hero: row.data.hero,
    homepageUpdatedAt: row.updatedAt,
    heroDesktopMediaPreview,
    heroMobileMediaPreview,
    heroSideMediaPreview,
  };
}
