import { createClient } from "@/lib/auth/session";
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
};

export type HomepageHeroPageData = {
  homepage: HomepageData;
  hero: HomepageHeroData;
  homepageUpdatedAt: string;
  heroMediaPreview: HomepageHeroMediaPreview | null;
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
    .select("id, storage_path, file_name, original_file_name, alt_text")
    .eq("id", mediaId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const url = getPublicMediaUrl(data.storage_path);

  return {
    id: data.id,
    url: url ?? "",
    alt: data.alt_text ?? data.original_file_name ?? data.file_name,
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

  const heroMediaPreview = await fetchHeroMediaPreview(row.data.hero.media_id);

  return {
    homepage: row.data,
    hero: row.data.hero,
    homepageUpdatedAt: row.updatedAt,
    heroMediaPreview,
  };
}
