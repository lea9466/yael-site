import { createClient } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { normalizeArticleContent } from "@/lib/articles/content";
import type { ArticleBlock } from "@/lib/articles/types";
import { ABOUT_SITE_CONTENT_KEY } from "@/lib/about/constants";
import {
  normalizeAboutPageData,
  type AboutPageData,
} from "@/lib/validations/about";

export type AboutMediaPreview = {
  id: string;
  url: string;
  alt: string;
};

export type AboutPageDetail = {
  data: AboutPageData;
  updatedAt: string;
  coverPreview: AboutMediaPreview | null;
  blockMediaUrls: Map<string, AboutMediaPreview>;
};

async function fetchMediaMap(
  mediaIds: string[]
): Promise<Map<string, AboutMediaPreview>> {
  const uniqueIds = [...new Set(mediaIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .select("id, storage_path, file_name, original_file_name, alt_text")
    .in("id", uniqueIds);

  if (error || !data) {
    return new Map();
  }

  const previews = new Map<string, AboutMediaPreview>();

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

function collectMediaIds(data: AboutPageData): string[] {
  const ids: string[] = [];

  if (data.cover_media_id) {
    ids.push(data.cover_media_id);
  }

  for (const block of data.content.blocks) {
    if (block.type === "image") {
      ids.push(block.media_id);
    }
  }

  for (const item of data.content.gallery) {
    ids.push(item.media_id);
  }

  return ids;
}

export async function fetchAboutSiteContent(): Promise<{
  data: AboutPageData;
  updatedAt: string;
} | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data, updated_at")
      .eq("key", ABOUT_SITE_CONTENT_KEY)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      data: normalizeAboutPageData(data.data),
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

export async function getAboutPageContent(): Promise<AboutPageData | null> {
  const row = await fetchAboutSiteContent();

  return row?.data ?? null;
}

export async function fetchAboutPageDetail(): Promise<AboutPageDetail | null> {
  const row = await fetchAboutSiteContent();

  if (!row) {
    return null;
  }

  const mediaIds = collectMediaIds(row.data);
  const mediaMap = await fetchMediaMap(mediaIds);

  return {
    data: row.data,
    updatedAt: row.updatedAt,
    coverPreview: row.data.cover_media_id
      ? mediaMap.get(row.data.cover_media_id) ?? null
      : null,
    blockMediaUrls: mediaMap,
  };
}

export function getAboutBlocksForRender(
  content: unknown
): ArticleBlock[] {
  return normalizeArticleContent(content).blocks;
}
