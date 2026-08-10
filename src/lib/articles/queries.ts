import { createClient } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import {
  normalizeArticleContent,
} from "@/lib/articles/content";
import { ARTICLES_PAGE_SIZE } from "@/lib/articles/constants";
import type {
  ArticleDetail,
  ArticleListItem,
  ArticleRecord,
  ArticlesListData,
  ArticleTagSummary,
} from "@/lib/articles/types";
import {
  fetchArticleCategories,
  fetchArticleTags,
} from "@/lib/taxonomy/queries";
import type { ListArticlesQuery, ArticleSortValue } from "@/lib/validations/article";

const ARTICLE_SELECT_COLUMNS =
  "id, title, slug, body, cover_media_id, seo_og_media_id, category_id, reading_time_minutes, content, seo, featured, status, published_at, created_at, updated_at";

type SortConfig = {
  column: "created_at" | "updated_at" | "title";
  ascending: boolean;
};

const SORT_CONFIG: Record<ArticleSortValue, SortConfig> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  title: { column: "title", ascending: true },
  updated: { column: "updated_at", ascending: false },
};

type MediaJoinRow = {
  storage_path: string;
  alt_text: string | null;
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function fetchCategoryMap(
  categoryIds: string[]
): Promise<Map<string, { name: string; slug: string }>> {
  const uniqueIds = [...new Set(categoryIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("type", "article")
    .in("id", uniqueIds);

  if (error || !data) {
    return new Map();
  }

  return new Map(
    data.map((row) => [
      row.id,
      {
        name: row.name,
        slug: row.slug,
      },
    ])
  );
}

async function fetchMediaMap(
  mediaIds: string[]
): Promise<Map<string, MediaJoinRow>> {
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
        storage_path: row.storage_path,
        alt_text: row.alt_text,
      },
    ])
  );
}

function parseJoinedTag(
  value: unknown
): { id: string; name: string; type: string } | null {
  if (Array.isArray(value)) {
    const first = value[0];

    if (
      typeof first === "object" &&
      first !== null &&
      "id" in first &&
      "name" in first &&
      "type" in first
    ) {
      return first as { id: string; name: string; type: string };
    }

    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "type" in value
  ) {
    return value as { id: string; name: string; type: string };
  }

  return null;
}

async function fetchArticleTagsMap(
  articleIds: string[]
): Promise<Map<string, ArticleTagSummary[]>> {
  if (articleIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article_tags")
    .select("article_id, tags(id, name, type)")
    .in("article_id", articleIds);

  if (error || !data) {
    return new Map();
  }

  const map = new Map<string, ArticleTagSummary[]>();

  for (const row of data) {
    const tag = parseJoinedTag(row.tags);

    if (!tag || tag.type !== "article") {
      continue;
    }

    const current = map.get(row.article_id) ?? [];
    current.push({ id: tag.id, name: tag.name });
    map.set(row.article_id, current);
  }

  return map;
}

function toArticleRecord(row: Record<string, unknown>): ArticleRecord {
  return {
    ...(row as ArticleRecord),
    content: normalizeArticleContent(row.content),
  };
}

function toArticleListItem(
  record: ArticleRecord,
  mediaMap: Map<string, MediaJoinRow>,
  categoryMap: Map<string, { name: string; slug: string }>,
  tagsMap: Map<string, ArticleTagSummary[]>
): ArticleListItem {
  const cover = mediaMap.get(record.cover_media_id);
  const category = categoryMap.get(record.category_id);
  const tags = tagsMap.get(record.id) ?? [];

  return {
    ...record,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
    coverAlt: cover?.alt_text ?? null,
    tagNames: tags.map((tag) => tag.name),
  };
}

export async function fetchArticlesList(
  query: ListArticlesQuery
): Promise<ArticlesListData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * ARTICLES_PAGE_SIZE;
    const to = from + ARTICLES_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("articles")
      .select(ARTICLE_SELECT_COLUMNS, { count: "exact" });

    if (query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(query.q)}%`;
      listQuery = listQuery.ilike("title", pattern);
    }

    if (query.status !== "all") {
      listQuery = listQuery.eq("status", query.status);
    }

    if (query.featured === "featured") {
      listQuery = listQuery.eq("featured", true);
    }

    if (query.category !== "all") {
      listQuery = listQuery.eq("category_id", query.category);
    }

    if (query.tag !== "all") {
      const { data: tagRows, error: tagError } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", query.tag);

      if (tagError) {
        return null;
      }

      const articleIds = (tagRows ?? []).map((row) => row.article_id);

      if (articleIds.length === 0) {
        const [categories, tags] = await Promise.all([
          fetchArticleCategories(),
          fetchArticleTags(),
        ]);

        return {
          items: [],
          pagination: {
            page: query.page,
            pageSize: ARTICLES_PAGE_SIZE,
            totalCount: 0,
            totalPages: 1,
          },
          query: {
            q: query.q,
            status: query.status,
            featured: query.featured,
            category: query.category,
            tag: query.tag,
            sort: query.sort,
            page: query.page,
          },
          categories,
          tags,
        };
      }

      listQuery = listQuery.in("id", articleIds);
    }

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    if (error) {
      return null;
    }

    const records = (data ?? []).map((row) =>
      toArticleRecord(row as Record<string, unknown>)
    );
    const mediaMap = await fetchMediaMap(
      records.map((record) => record.cover_media_id)
    );
    const categoryMap = await fetchCategoryMap(
      records.map((record) => record.category_id)
    );
    const tagsMap = await fetchArticleTagsMap(records.map((record) => record.id));
    const [categories, tags] = await Promise.all([
      fetchArticleCategories(),
      fetchArticleTags(),
    ]);

    const filteredCount = count ?? 0;

    return {
      items: records.map((record) =>
        toArticleListItem(record, mediaMap, categoryMap, tagsMap)
      ),
      pagination: {
        page: query.page,
        pageSize: ARTICLES_PAGE_SIZE,
        totalCount: filteredCount,
        totalPages: Math.max(1, Math.ceil(filteredCount / ARTICLES_PAGE_SIZE)),
      },
      query: {
        q: query.q,
        status: query.status,
        featured: query.featured,
        category: query.category,
        tag: query.tag,
        sort: query.sort,
        page: query.page,
      },
      categories,
      tags,
    };
  } catch {
    return null;
  }
}

export async function fetchArticleById(id: string): Promise<ArticleDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = toArticleRecord(data as Record<string, unknown>);
    const blockMediaIds = record.content.blocks
      .filter((block) => block.type === "image")
      .map((block) => block.media_id);
    const mediaIds = [
      record.cover_media_id,
      record.seo_og_media_id,
      ...record.content.gallery.map((item) => item.media_id),
      ...blockMediaIds,
    ].filter((value): value is string => Boolean(value));

    const mediaMap = await fetchMediaMap(mediaIds);
    const cover = mediaMap.get(record.cover_media_id);
    const og = record.seo_og_media_id
      ? mediaMap.get(record.seo_og_media_id)
      : undefined;

    const { data: categoryData } = await supabase
      .from("categories")
      .select("id, name, slug, type")
      .eq("id", record.category_id)
      .maybeSingle();

    const { data: tagRows } = await supabase
      .from("article_tags")
      .select("tag_id, tags(id, name, type)")
      .eq("article_id", record.id);

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
      ...record,
      category_id: record.category_id,
      category:
        categoryData && categoryData.type === "article"
          ? {
              id: categoryData.id,
              name: categoryData.name,
              slug: categoryData.slug,
            }
          : null,
      coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
      coverAlt: cover?.alt_text ?? null,
      ogUrl: og ? getPublicMediaUrl(og.storage_path) : null,
      ogAlt: og?.alt_text ?? null,
      tags,
      galleryUrls: record.content.gallery
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

export async function isArticleSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from("articles").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    return true;
  }

  return (data?.length ?? 0) > 0;
}

export async function verifyMediaExists(mediaId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .select("id")
    .eq("id", mediaId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function fetchArticleTagIds(articleId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", articleId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.tag_id);
}
