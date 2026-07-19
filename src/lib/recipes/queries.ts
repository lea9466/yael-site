import { createClient } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { createDefaultRecipeContent } from "@/lib/recipes/content";
import { RECIPES_PAGE_SIZE } from "@/lib/recipes/constants";
import type {
  RecipeContent,
  RecipeDetail,
  RecipeListItem,
  RecipeRecord,
  RecipesListData,
  RecipeTagSummary,
} from "@/lib/recipes/types";
import {
  fetchRecipeCategories,
  fetchRecipeTags,
} from "@/lib/taxonomy/queries";
import type { ListRecipesQuery, RecipeSortValue } from "@/lib/validations/recipe";

const RECIPE_SELECT_COLUMNS =
  "id, title, slug, description, cover_media_id, seo_og_media_id, category_id, prep_duration, servings, difficulty, content, seo, featured, status, published_at, created_at, updated_at";

type SortConfig = {
  column: "created_at" | "updated_at" | "title";
  ascending: boolean;
};

const SORT_CONFIG: Record<RecipeSortValue, SortConfig> = {
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

function normalizeRecipeContent(content: unknown): RecipeContent {
  if (
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    return createDefaultRecipeContent();
  }

  const record = content as Partial<RecipeContent>;

  return {
    ingredients: Array.isArray(record.ingredients) ? record.ingredients : [],
    steps: Array.isArray(record.steps) ? record.steps : [],
    yael_tip:
      typeof record.yael_tip === "string" && record.yael_tip.trim().length > 0
        ? record.yael_tip
        : null,
    gallery: Array.isArray(record.gallery) ? record.gallery : [],
  };
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

async function fetchCategoryMap(
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

async function fetchRecipeTagsMap(
  recipeIds: string[]
): Promise<Map<string, RecipeTagSummary[]>> {
  if (recipeIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipe_tags")
    .select("recipe_id, tags(id, name, type)")
    .in("recipe_id", recipeIds);

  if (error || !data) {
    return new Map();
  }

  const map = new Map<string, RecipeTagSummary[]>();

  for (const row of data) {
    const tag = parseJoinedTag(row.tags);

    if (!tag || tag.type !== "recipe") {
      continue;
    }

    const current = map.get(row.recipe_id) ?? [];
    current.push({ id: tag.id, name: tag.name });
    map.set(row.recipe_id, current);
  }

  return map;
}

function toRecipeRecord(row: Record<string, unknown>): RecipeRecord {
  return {
    ...(row as RecipeRecord),
    content: normalizeRecipeContent(row.content),
  };
}

function toRecipeListItem(
  record: RecipeRecord,
  mediaMap: Map<string, MediaJoinRow>,
  categoryMap: Map<string, string>,
  tagsMap: Map<string, RecipeTagSummary[]>
): RecipeListItem {
  const cover = mediaMap.get(record.cover_media_id);
  const tags = tagsMap.get(record.id) ?? [];

  return {
    ...record,
    coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
    coverAlt: cover?.alt_text ?? null,
    categoryName: categoryMap.get(record.category_id) ?? null,
    tagNames: tags.map((tag) => tag.name),
  };
}

export async function fetchRecipesList(
  query: ListRecipesQuery
): Promise<RecipesListData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * RECIPES_PAGE_SIZE;
    const to = from + RECIPES_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("recipes")
      .select(RECIPE_SELECT_COLUMNS, { count: "exact" });

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
        .from("recipe_tags")
        .select("recipe_id")
        .eq("tag_id", query.tag);

      if (tagError) {
        return null;
      }

      const recipeIds = (tagRows ?? []).map((row) => row.recipe_id);

      if (recipeIds.length === 0) {
        const [categories, tags] = await Promise.all([
          fetchRecipeCategories(),
          fetchRecipeTags(),
        ]);

        return {
          items: [],
          pagination: {
            page: query.page,
            pageSize: RECIPES_PAGE_SIZE,
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

      listQuery = listQuery.in("id", recipeIds);
    }

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    if (error) {
      return null;
    }

    const records = (data ?? []).map((row) =>
      toRecipeRecord(row as Record<string, unknown>)
    );
    const mediaMap = await fetchMediaMap(
      records.map((record) => record.cover_media_id)
    );
    const categoryMap = await fetchCategoryMap(
      records.map((record) => record.category_id)
    );
    const tagsMap = await fetchRecipeTagsMap(records.map((record) => record.id));
    const [categories, tags] = await Promise.all([
      fetchRecipeCategories(),
      fetchRecipeTags(),
    ]);

    const filteredCount = count ?? 0;

    return {
      items: records.map((record) =>
        toRecipeListItem(record, mediaMap, categoryMap, tagsMap)
      ),
      pagination: {
        page: query.page,
        pageSize: RECIPES_PAGE_SIZE,
        totalCount: filteredCount,
        totalPages: Math.max(1, Math.ceil(filteredCount / RECIPES_PAGE_SIZE)),
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

export async function fetchRecipeById(id: string): Promise<RecipeDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("recipes")
      .select(RECIPE_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = toRecipeRecord(data as Record<string, unknown>);
    const mediaIds = [
      record.cover_media_id,
      record.seo_og_media_id,
      ...record.content.gallery.map((item) => item.media_id),
    ].filter((value): value is string => Boolean(value));

    const mediaMap = await fetchMediaMap(mediaIds);
    const cover = mediaMap.get(record.cover_media_id);
    const og = record.seo_og_media_id
      ? mediaMap.get(record.seo_og_media_id)
      : undefined;

    const { data: categoryData } = await supabase
      .from("categories")
      .select("id, name, type")
      .eq("id", record.category_id)
      .maybeSingle();

    const { data: tagRows } = await supabase
      .from("recipe_tags")
      .select("tag_id, tags(id, name, type)")
      .eq("recipe_id", record.id);

    const tags =
      tagRows
        ?.map((row) => parseJoinedTag(row.tags))
        .filter(
          (tag): tag is { id: string; name: string; type: string } =>
            tag !== null && tag.type === "recipe"
        )
        .map((tag) => ({ id: tag.id, name: tag.name })) ?? [];

    return {
      ...record,
      coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
      coverAlt: cover?.alt_text ?? null,
      ogUrl: og ? getPublicMediaUrl(og.storage_path) : null,
      ogAlt: og?.alt_text ?? null,
      category:
        categoryData && categoryData.type === "recipe"
          ? { id: categoryData.id, name: categoryData.name }
          : null,
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
    };
  } catch {
    return null;
  }
}

export async function isRecipeSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from("recipes").select("id").eq("slug", slug);

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

export async function fetchRecipeTagIds(recipeId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipe_tags")
    .select("tag_id")
    .eq("recipe_id", recipeId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.tag_id);
}
