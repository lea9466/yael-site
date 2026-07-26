import type { SupabaseClient } from "@supabase/supabase-js";

import type { MediaUsageReference } from "@/lib/media/media-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function galleryContainsMediaId(
  gallery: unknown,
  mediaId: string
): boolean {
  if (!Array.isArray(gallery)) {
    return false;
  }

  return gallery.some(
    (item) => isRecord(item) && item.media_id === mediaId
  );
}

async function findHardForeignKeyUsages(
  supabase: SupabaseClient,
  mediaId: string
): Promise<MediaUsageReference[]> {
  const usages: MediaUsageReference[] = [];

  const checks = [
    {
      table: "services",
      column: "cover_media_id",
      label: "שירות — תמונת כיסוי",
      nameColumn: "title",
    },
    {
      table: "services",
      column: "seo_og_media_id",
      label: "שירות — תמונת SEO",
      nameColumn: "title",
    },
    {
      table: "recipes",
      column: "cover_media_id",
      label: "מתכון — תמונת כיסוי",
      nameColumn: "title",
    },
    {
      table: "recipes",
      column: "seo_og_media_id",
      label: "מתכון — תמונת SEO",
      nameColumn: "title",
    },
    {
      table: "articles",
      column: "cover_media_id",
      label: "פוסט — תמונת כיסוי",
      nameColumn: "title",
    },
    {
      table: "articles",
      column: "seo_og_media_id",
      label: "פוסט — תמונת SEO",
      nameColumn: "title",
    },
    {
      table: "categories",
      column: "image_media_id",
      label: "קטגוריה — תמונה",
      nameColumn: "name",
    },
    {
      table: "press_articles",
      column: "pdf_media_id",
      label: "כתבה — קובץ PDF",
      nameColumn: "title",
    },
  ] as const;

  for (const check of checks) {
    const { data, error } = await supabase
      .from(check.table)
      .select(check.nameColumn)
      .eq(check.column, mediaId);

    if (error || !data) {
      continue;
    }

    for (const row of data) {
      const displayName = row[check.nameColumn as keyof typeof row];

      usages.push({
        label: `${check.label}: ${String(displayName ?? "")}`,
      });
    }
  }

  return usages;
}

async function findRecipeGalleryUsages(
  supabase: SupabaseClient,
  mediaId: string
): Promise<MediaUsageReference[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("title, content")
    .limit(500);

  if (error || !data) {
    return [];
  }

  const usages: MediaUsageReference[] = [];

  for (const row of data) {
    if (!isRecord(row.content)) {
      continue;
    }

    if (galleryContainsMediaId(row.content.gallery, mediaId)) {
      usages.push({
        label: `מתכון — גלריה: ${row.title}`,
      });
    }
  }

  return usages;
}

async function findArticleGalleryUsages(
  supabase: SupabaseClient,
  mediaId: string
): Promise<MediaUsageReference[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("title, content")
    .limit(500);

  if (error || !data) {
    return [];
  }

  const usages: MediaUsageReference[] = [];

  for (const row of data) {
    if (!isRecord(row.content)) {
      continue;
    }

    if (galleryContainsMediaId(row.content.gallery, mediaId)) {
      usages.push({
        label: `פוסט — גלריה: ${row.title}`,
      });
    }
  }

  return usages;
}

function blocksContainMediaId(blocks: unknown, mediaId: string): boolean {
  if (!Array.isArray(blocks)) {
    return false;
  }

  return blocks.some(
    (block) =>
      isRecord(block) &&
      block.type === "image" &&
      block.media_id === mediaId
  );
}

function siteContentContainsMediaId(
  key: string,
  data: unknown,
  mediaId: string
): boolean {
  if (!isRecord(data)) {
    return false;
  }

  switch (key) {
    case "homepage": {
      const hero = data.hero;

      return (
        isRecord(hero) &&
        (hero.media_id === mediaId || hero.mobile_media_id === mediaId)
      );
    }
    case "about":
      return (
        data.cover_media_id === mediaId ||
        blocksContainMediaId(
          isRecord(data.content) ? data.content.blocks : undefined,
          mediaId
        )
      );
    case "business_profile":
      return (
        data.logo_media_id === mediaId || data.favicon_media_id === mediaId
      );
    case "site_settings": {
      const defaultSeo = data.default_seo;

      return isRecord(defaultSeo) && defaultSeo.og_media_id === mediaId;
    }
    case "certificates": {
      const items = data.items;

      if (!Array.isArray(items)) {
        return false;
      }

      return items.some(
        (item) => isRecord(item) && item.media_id === mediaId
      );
    }
    default:
      return false;
  }
}

async function findSiteContentUsages(
  supabase: SupabaseClient,
  mediaId: string
): Promise<MediaUsageReference[]> {
  const { data, error } = await supabase.from("site_content").select("key, data");

  if (error || !data) {
    return [];
  }

  const labelByKey: Record<string, string> = {
    homepage: "דף הבית — hero.media_id",
    about: "אודות — cover_media_id / content.blocks[].media_id",
    business_profile: "פרופיל עסקי — logo_media_id / favicon_media_id",
    site_settings: "הגדרות אתר — default_seo.og_media_id",
    certificates: "תעודות — items[].media_id",
  };

  const usages: MediaUsageReference[] = [];

  for (const row of data) {
    if (!siteContentContainsMediaId(row.key, row.data, mediaId)) {
      continue;
    }

    usages.push({
      label: labelByKey[row.key] ?? `תוכן אתר: ${row.key}`,
    });
  }

  return usages;
}

export async function findMediaUsages(
  supabase: SupabaseClient,
  mediaId: string
): Promise<MediaUsageReference[]> {
  const [hardFks, recipeGallery, articleGallery, siteContent] =
    await Promise.all([
      findHardForeignKeyUsages(supabase, mediaId),
      findRecipeGalleryUsages(supabase, mediaId),
      findArticleGalleryUsages(supabase, mediaId),
      findSiteContentUsages(supabase, mediaId),
    ]);

  return [...hardFks, ...recipeGallery, ...articleGallery, ...siteContent];
}
