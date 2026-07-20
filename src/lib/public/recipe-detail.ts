import {
  createClient,
  getAuthenticatedAdmin,
  isSupabaseConfigured,
} from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { normalizeRecipeContent } from "@/lib/recipes/content";
import type { RecipeDetail } from "@/lib/recipes/types";
import type { PublicRecipeSummary } from "@/lib/public/types";
import type { RecipeDifficulty } from "@/lib/recipes/constants";
import type { StoredSeo } from "@/lib/seo/types";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";
import type { ContentStatus } from "@/types/content";

const RECIPE_DETAIL_COLUMNS =
  "id, title, slug, description, cover_media_id, seo_og_media_id, category_id, prep_duration, servings, difficulty, content, seo, featured, status, published_at, created_at, updated_at";

const RECIPE_RELATED_COLUMNS =
  "id, title, slug, description, cover_media_id, category_id, prep_duration, servings, difficulty, featured, published_at, updated_at, created_at";

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

async function fetchCategorySummaries(
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
    .eq("type", "recipe")
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
  mediaMap: Map<string, MediaRow>,
  categoryMap: Map<string, { name: string; slug: string }>
): PublicRecipeSummary {
  const cover = mediaMap.get(row.cover_media_id as string);
  const category = categoryMap.get(row.category_id as string);

  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    description: row.description as string,
    coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
    coverAlt: cover?.alt_text ?? null,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    prep_duration: row.prep_duration as string,
    servings: row.servings as string,
    difficulty: row.difficulty as RecipeDifficulty,
    featured: Boolean(row.featured),
    published_at: (row.published_at as string | null) ?? null,
  };
}

function getRecipeSortTimestamp(row: Record<string, unknown>): number {
  const value =
    (row.published_at as string | null) ?? (row.created_at as string | null) ?? "";
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortRecipesByRecency(
  rows: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  return rows
    .slice()
    .sort((left, right) => getRecipeSortTimestamp(right) - getRecipeSortTimestamp(left));
}

function isContentStatus(value: unknown): value is ContentStatus {
  return value === "draft" || value === "published" || value === "archived";
}

async function fetchRecipeDetailBySlug(
  slug: string,
  options: { publishedOnly: boolean }
): Promise<RecipeDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalizedSlug = normalizeRouteSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("recipes")
      .select(RECIPE_DETAIL_COLUMNS)
      .eq("slug", normalizedSlug);

    if (options.publishedOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    const content = normalizeRecipeContent(data.content);
    const seo = normalizeSeo(data.seo);
    const mediaIds = [
      data.cover_media_id as string,
      data.seo_og_media_id as string | null,
      ...(content.gallery ?? []).map((item) => item.media_id),
    ].filter((value): value is string => Boolean(value));

    const mediaMap = await fetchMediaMap(mediaIds);
    const cover = mediaMap.get(data.cover_media_id as string);
    const og = data.seo_og_media_id
      ? mediaMap.get(data.seo_og_media_id as string)
      : undefined;

    const { data: categoryData } = await supabase
      .from("categories")
      .select("id, name, slug, type")
      .eq("id", data.category_id as string)
      .maybeSingle();

    const { data: tagRows } = await supabase
      .from("recipe_tags")
      .select("tag_id, tags(id, name, type)")
      .eq("recipe_id", data.id as string);

    const tags =
      tagRows
        ?.map((row) => parseJoinedTag(row.tags))
        .filter(
          (tag): tag is { id: string; name: string; type: string } =>
            tag !== null && tag.type === "recipe"
        )
        .map((tag) => ({ id: tag.id, name: tag.name })) ?? [];

    const status = isContentStatus(data.status) ? data.status : "draft";

    return {
      id: data.id as string,
      title: data.title as string,
      slug: data.slug as string,
      description: data.description as string,
      cover_media_id: data.cover_media_id as string,
      seo_og_media_id: (data.seo_og_media_id as string | null) ?? null,
      category_id: data.category_id as string,
      prep_duration: data.prep_duration as string,
      servings: data.servings as string,
      difficulty: data.difficulty as RecipeDifficulty,
      content,
      seo,
      featured: Boolean(data.featured),
      status,
      published_at: (data.published_at as string | null) ?? null,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
      coverAlt: cover?.alt_text ?? null,
      ogUrl: og ? getPublicMediaUrl(og.storage_path) : null,
      ogAlt: og?.alt_text ?? null,
      category:
        categoryData && categoryData.type === "recipe"
          ? {
              id: categoryData.id,
              name: categoryData.name,
              slug: categoryData.slug,
            }
          : null,
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
    };
  } catch {
    return null;
  }
}

export async function getPublishedRecipeBySlug(
  slug: string
): Promise<RecipeDetail | null> {
  return fetchRecipeDetailBySlug(slug, { publishedOnly: true });
}

/**
 * Resolves a recipe for the public detail route.
 * Published recipes are available to everyone.
 * Draft/archived recipes are available only to the authenticated administrator
 * (so local "view on site" works before publish).
 */
export async function resolvePublicRecipePage(
  slug: string
): Promise<{ recipe: RecipeDetail; isAdminOnlyPreview: boolean } | null> {
  const published = await getPublishedRecipeBySlug(slug);

  if (published) {
    return { recipe: published, isAdminOnlyPreview: false };
  }

  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const unpublished = await fetchRecipeDetailBySlug(slug, {
    publishedOnly: false,
  });

  if (!unpublished || unpublished.status === "published") {
    return null;
  }

  return { recipe: unpublished, isAdminOnlyPreview: true };
}

export async function getRelatedRecipes(input: {
  recipeId: string;
  categoryId: string;
  limit?: number;
}): Promise<PublicRecipeSummary[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const limit = input.limit ?? 3;

  try {
    const supabase = await createClient();

    const { data: sameCategoryData, error: sameCategoryError } = await supabase
      .from("recipes")
      .select(RECIPE_RELATED_COLUMNS)
      .eq("status", "published")
      .eq("category_id", input.categoryId)
      .neq("id", input.recipeId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (sameCategoryError) {
      return [];
    }

    const sameCategory = sortRecipesByRecency(
      (sameCategoryData ?? []) as Array<Record<string, unknown>>
    );
    const collected = sameCategory.slice(0, limit);
    const collectedIds = new Set(collected.map((row) => row.id as string));

    if (collected.length < limit) {
      const { data: recentData, error: recentError } = await supabase
        .from("recipes")
        .select(RECIPE_RELATED_COLUMNS)
        .eq("status", "published")
        .neq("id", input.recipeId)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(limit * 3);

      if (!recentError && recentData) {
        const recent = sortRecipesByRecency(
          recentData as Array<Record<string, unknown>>
        );

        for (const row of recent) {
          const id = row.id as string;

          if (collectedIds.has(id)) {
            continue;
          }

          collected.push(row);
          collectedIds.add(id);

          if (collected.length >= limit) {
            break;
          }
        }
      }
    }

    const rows = collected.slice(0, limit);

    if (rows.length === 0) {
      return [];
    }

    const mediaMap = await fetchMediaMap(
      rows.map((row) => row.cover_media_id as string)
    );
    const categoryMap = await fetchCategorySummaries(
      rows.map((row) => row.category_id as string)
    );

    return rows.map((row) => mapRelatedRow(row, mediaMap, categoryMap));
  } catch {
    return [];
  }
}
