import { createClient, isSupabaseConfigured } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { normalizeArticleContent } from "@/lib/articles/content";
import type { ArticleDetail } from "@/lib/articles/types";
import type { PublicPostSummary } from "@/lib/public/types";
import { shortenForSeoDescription } from "@/lib/seo/resolve";
import type { StoredSeo } from "@/lib/seo/types";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

const ARTICLE_DETAIL_COLUMNS =
  "id, title, slug, body, cover_media_id, seo_og_media_id, reading_time_minutes, content, seo, featured, status, published_at, created_at, updated_at";

const ARTICLE_RELATED_COLUMNS =
  "id, title, slug, body, cover_media_id, reading_time_minutes, featured, published_at, updated_at, created_at";

type MediaRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
};

function normalizeSeo(seo: unknown): StoredSeo {
  if (typeof seo !== "object" || seo === null || Array.isArray(seo)) {
    return { title: "", description: "", canonical_url: null };
  }

  const record = seo as Partial<StoredSeo>;

  return {
    title: typeof record.title === "string" ? record.title : "",
    description:
      typeof record.description === "string" ? record.description : "",
    canonical_url:
      typeof record.canonical_url === "string" ? record.canonical_url : null,
  };
}

async function fetchMediaMap(
  mediaIds: string[]
): Promise<Map<string, MediaRow>> {
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

  return new Map((data as MediaRow[]).map((row) => [row.id, row]));
}

function parseJoinedTag(
  value: unknown
): { id: string; name: string; type: string } | null {
  const tag = Array.isArray(value) ? value[0] : value;

  if (
    typeof tag !== "object" ||
    tag === null ||
    typeof (tag as { id?: unknown }).id !== "string" ||
    typeof (tag as { name?: unknown }).name !== "string" ||
    typeof (tag as { type?: unknown }).type !== "string"
  ) {
    return null;
  }

  return tag as { id: string; name: string; type: string };
}

function mapRelatedRow(
  row: Record<string, unknown>,
  mediaMap: Map<string, MediaRow>
): PublicPostSummary {
  const cover = mediaMap.get(row.cover_media_id as string);

  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: shortenForSeoDescription(row.body as string, 180),
    coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
    coverAlt: cover?.alt_text ?? null,
    reading_time_minutes: row.reading_time_minutes as number,
    featured: Boolean(row.featured),
    published_at: (row.published_at as string | null) ?? null,
  };
}

function getArticleSortTimestamp(row: Record<string, unknown>): number {
  const value =
    (row.published_at as string | null) ??
    (row.created_at as string | null) ??
    "";
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortArticlesByRecency(
  rows: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  return rows
    .slice()
    .sort(
      (left, right) =>
        getArticleSortTimestamp(right) - getArticleSortTimestamp(left)
    );
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<ArticleDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalizedSlug = normalizeRouteSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_DETAIL_COLUMNS)
      .eq("slug", normalizedSlug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const content = normalizeArticleContent(data.content);
    const seo = normalizeSeo(data.seo);
    const blockMediaIds = content.blocks
      .filter((block) => block.type === "image")
      .map((block) => block.media_id);
    const mediaIds = [
      data.cover_media_id as string,
      data.seo_og_media_id as string | null,
      ...(content.gallery ?? []).map((item) => item.media_id),
      ...blockMediaIds,
    ].filter((value): value is string => Boolean(value));

    const mediaMap = await fetchMediaMap(mediaIds);
    const cover = mediaMap.get(data.cover_media_id as string);
    const og = data.seo_og_media_id
      ? mediaMap.get(data.seo_og_media_id as string)
      : undefined;

    const { data: tagRows } = await supabase
      .from("article_tags")
      .select("tag_id, tags(id, name, type)")
      .eq("article_id", data.id as string);

    const tags =
      tagRows
        ?.map((row) => parseJoinedTag(row.tags))
        .filter(
          (tag): tag is { id: string; name: string; type: string } =>
            tag !== null && tag.type === "article"
        )
        .map((tag) => ({ id: tag.id, name: tag.name })) ?? [];

    const blockMediaUrls = new Map<
      string,
      { url: string | null; alt: string | null }
    >();

    for (const mediaId of blockMediaIds) {
      const media = mediaMap.get(mediaId);
      blockMediaUrls.set(mediaId, {
        url: media ? getPublicMediaUrl(media.storage_path) : null,
        alt: media?.alt_text ?? null,
      });
    }

    return {
      id: data.id as string,
      title: data.title as string,
      slug: data.slug as string,
      body: data.body as string,
      cover_media_id: data.cover_media_id as string,
      seo_og_media_id: (data.seo_og_media_id as string | null) ?? null,
      reading_time_minutes: data.reading_time_minutes as number,
      content,
      seo,
      featured: Boolean(data.featured),
      status: "published",
      published_at: (data.published_at as string | null) ?? null,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
      coverAlt: cover?.alt_text ?? null,
      ogUrl: og ? getPublicMediaUrl(og.storage_path) : null,
      ogAlt: og?.alt_text ?? null,
      tags,
      galleryUrls: (content.gallery ?? [])
        .slice()
        .sort((left, right) => left.order - right.order)
        .map((item) => {
          const media = mediaMap.get(item.media_id);

          return {
            media_id: item.media_id,
            order: item.order,
            url: media ? getPublicMediaUrl(media.storage_path) : null,
            alt: media?.alt_text ?? null,
          };
        }),
      blockMediaUrls,
    };
  } catch {
    return null;
  }
}

export async function getRelatedPosts(input: {
  articleId: string;
  limit?: number;
}): Promise<PublicPostSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const limit = input.limit ?? 3;

  try {
    const supabase = await createClient();

    const { data: recentData, error: recentError } = await supabase
      .from("articles")
      .select(ARTICLE_RELATED_COLUMNS)
      .eq("status", "published")
      .neq("id", input.articleId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (recentError || !recentData) {
      return [];
    }

    const rows = sortArticlesByRecency(
      recentData as Array<Record<string, unknown>>
    ).slice(0, limit);

    if (rows.length === 0) {
      return [];
    }

    const mediaMap = await fetchMediaMap(
      rows.map((row) => row.cover_media_id as string)
    );

    return rows.map((row) => mapRelatedRow(row, mediaMap));
  } catch {
    return [];
  }
}
