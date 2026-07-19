import { createClient, isSupabaseConfigured } from "@/lib/auth/session";
import { getAboutPageContent } from "@/lib/about/queries";
import { getHomepageContent as fetchHomepageContent } from "@/lib/homepage/queries";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import {
  BUSINESS_PROFILE_SITE_CONTENT_KEY,
  SITE_SETTINGS_SITE_CONTENT_KEY,
} from "@/lib/settings/constants";
import {
  getDefaultBusinessProfile,
  getDefaultSiteSettings,
} from "@/lib/settings/defaults";
import { shortenForSeoDescription } from "@/lib/seo/resolve";
import {
  normalizeBusinessProfile,
  normalizeSiteSettings,
} from "@/lib/validations/site-settings";
import type {
  PublicAboutContent,
  PublicContentSlug,
  PublicHomepageContent,
  PublicMediaPreview,
  PublicPostSummary,
  PublicRecipeSummary,
  PublicServiceSummary,
  PublicTestimonialSummary,
  WebsiteSettingsPublic,
} from "@/lib/public/types";

const MEDIA_SELECT_COLUMNS =
  "id, storage_path, file_name, original_file_name, alt_text";

const SERVICE_PUBLIC_COLUMNS =
  "id, title, slug, short_description, cover_media_id, featured, published_at, updated_at";

const RECIPE_PUBLIC_COLUMNS =
  "id, title, slug, description, cover_media_id, category_id, prep_duration, servings, difficulty, featured, published_at, updated_at";

const ARTICLE_PUBLIC_COLUMNS =
  "id, title, slug, body, cover_media_id, category_id, reading_time_minutes, featured, published_at, updated_at";

const TESTIMONIAL_PUBLIC_COLUMNS =
  "id, name, city, content, service_id, featured, is_published, updated_at";

type MediaRow = {
  id: string;
  storage_path: string;
  file_name: string;
  original_file_name: string;
  alt_text: string | null;
};

export function getDefaultWebsiteSettingsPublic(): WebsiteSettingsPublic {
  return {
    businessProfile: getDefaultBusinessProfile(),
    siteSettings: getDefaultSiteSettings(),
    logo: null,
    favicon: null,
    ogImage: null,
  };
}

async function fetchMediaPreviewsByIds(
  mediaIds: Array<string | null>
): Promise<Map<string, PublicMediaPreview>> {
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

  const previews = new Map<string, PublicMediaPreview>();

  for (const row of data as MediaRow[]) {
    const url = getPublicMediaUrl(row.storage_path);

    previews.set(row.id, {
      id: row.id,
      url: url ?? "",
      alt: row.alt_text ?? row.original_file_name ?? row.file_name,
    });
  }

  return previews;
}

async function fetchCoverMediaMap(
  mediaIds: string[]
): Promise<Map<string, { url: string | null; alt: string | null }>> {
  const uniqueIds = [...new Set(mediaIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .select("id, storage_path, alt_text")
    .in("id", uniqueIds);

  if (error || !data) {
    return new Map();
  }

  return new Map(
    data.map((row) => [
      row.id,
      {
        url: getPublicMediaUrl(row.storage_path),
        alt: row.alt_text,
      },
    ])
  );
}

async function fetchCategoryNames(
  categoryIds: string[]
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(categoryIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", uniqueIds);

  if (error || !data) {
    return new Map();
  }

  return new Map(data.map((row) => [row.id, row.name]));
}

async function fetchServiceTitles(
  serviceIds: string[]
): Promise<Map<string, string>> {
  const titles = new Map<string, string>();

  if (serviceIds.length === 0) {
    return titles;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, title")
    .in("id", serviceIds)
    .eq("status", "published");

  if (!error && data) {
    for (const row of data) {
      titles.set(row.id, row.title);
    }
  }

  return titles;
}

export async function getWebsiteSettings(): Promise<WebsiteSettingsPublic> {
  if (!isSupabaseConfigured()) {
    return getDefaultWebsiteSettingsPublic();
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("key, data")
      .in("key", [
        BUSINESS_PROFILE_SITE_CONTENT_KEY,
        SITE_SETTINGS_SITE_CONTENT_KEY,
      ]);

    if (error || !data) {
      return getDefaultWebsiteSettingsPublic();
    }

    const businessRow = data.find(
      (row) => row.key === BUSINESS_PROFILE_SITE_CONTENT_KEY
    );
    const settingsRow = data.find(
      (row) => row.key === SITE_SETTINGS_SITE_CONTENT_KEY
    );

    const businessProfile = normalizeBusinessProfile(businessRow?.data);
    const siteSettings = normalizeSiteSettings(settingsRow?.data);

    const previews = await fetchMediaPreviewsByIds([
      businessProfile.logo_media_id,
      businessProfile.favicon_media_id,
      siteSettings.default_seo.og_media_id,
    ]);

    return {
      businessProfile,
      siteSettings,
      logo: businessProfile.logo_media_id
        ? previews.get(businessProfile.logo_media_id) ?? null
        : null,
      favicon: businessProfile.favicon_media_id
        ? previews.get(businessProfile.favicon_media_id) ?? null
        : null,
      ogImage: siteSettings.default_seo.og_media_id
        ? previews.get(siteSettings.default_seo.og_media_id) ?? null
        : null,
    };
  } catch {
    return getDefaultWebsiteSettingsPublic();
  }
}

export async function getHomepageContent(): Promise<PublicHomepageContent | null> {
  return fetchHomepageContent();
}

export async function getAboutContent(): Promise<PublicAboutContent | null> {
  return getAboutPageContent();
}

export async function getPublishedServices(): Promise<PublicServiceSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select(SERVICE_PUBLIC_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    const mediaMap = await fetchCoverMediaMap(
      data.map((row) => row.cover_media_id as string)
    );

    return data.map((row) => {
      const cover = mediaMap.get(row.cover_media_id as string);

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        short_description: row.short_description,
        coverUrl: cover?.url ?? null,
        coverAlt: cover?.alt ?? null,
        featured: row.featured,
        published_at: row.published_at,
      };
    });
  } catch {
    return [];
  }
}

export async function getPublishedRecipes(): Promise<PublicRecipeSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("recipes")
      .select(RECIPE_PUBLIC_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    const mediaMap = await fetchCoverMediaMap(
      data.map((row) => row.cover_media_id as string)
    );
    const categoryMap = await fetchCategoryNames(
      data.map((row) => row.category_id as string)
    );

    return data.map((row) => {
      const cover = mediaMap.get(row.cover_media_id as string);

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        coverUrl: cover?.url ?? null,
        coverAlt: cover?.alt ?? null,
        categoryName: categoryMap.get(row.category_id as string) ?? null,
        prep_duration: row.prep_duration,
        servings: row.servings,
        difficulty: row.difficulty,
        featured: row.featured,
        published_at: row.published_at,
      };
    });
  } catch {
    return [];
  }
}

export async function getPublishedPosts(): Promise<PublicPostSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_PUBLIC_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    const mediaMap = await fetchCoverMediaMap(
      data.map((row) => row.cover_media_id as string)
    );
    const categoryMap = await fetchCategoryNames(
      data.map((row) => row.category_id as string)
    );

    return data.map((row) => {
      const cover = mediaMap.get(row.cover_media_id as string);

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: shortenForSeoDescription(row.body as string, 180),
        coverUrl: cover?.url ?? null,
        coverAlt: cover?.alt ?? null,
        categoryName: categoryMap.get(row.category_id as string) ?? null,
        reading_time_minutes: row.reading_time_minutes,
        featured: row.featured,
        published_at: row.published_at,
      };
    });
  } catch {
    return [];
  }
}

export async function getPublishedTestimonials(): Promise<
  PublicTestimonialSummary[]
> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select(TESTIMONIAL_PUBLIC_COLUMNS)
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    const serviceIds = data
      .map((row) => row.service_id)
      .filter((id): id is string => id !== null);
    const serviceTitles = await fetchServiceTitles(serviceIds);

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      content: row.content,
      serviceTitle: row.service_id
        ? serviceTitles.get(row.service_id) ?? null
        : null,
      featured: row.featured,
    }));
  } catch {
    return [];
  }
}

export async function getPublishedServiceSlugs(): Promise<PublicContentSlug[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("slug, updated_at")
      .eq("status", "published");

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      slug: row.slug,
      updated_at: row.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function getPublishedRecipeSlugs(): Promise<PublicContentSlug[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("recipes")
      .select("slug, updated_at")
      .eq("status", "published");

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      slug: row.slug,
      updated_at: row.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function getPublishedPostSlugs(): Promise<PublicContentSlug[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("status", "published");

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      slug: row.slug,
      updated_at: row.updated_at,
    }));
  } catch {
    return [];
  }
}
