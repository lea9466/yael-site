import { createClient, isSupabaseConfigured } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import type { PublicRecipeSummary } from "@/lib/public/types";
import {
  PUBLIC_RECIPES_PAGE_SIZE,
  type PublicRecipeListingQuery,
} from "@/lib/validations/public-recipe-listing";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

const RECIPE_PUBLIC_COLUMNS =
  "id, title, card_title, slug, description, cover_media_id, category_id, prep_duration, servings, featured, published_at, updated_at";

export type PublicRecipeCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PublicRecipeTag = {
  id: string;
  name: string;
  slug: string;
};

export type PublicRecipeListingResult = {
  recipes: PublicRecipeSummary[];
  categories: PublicRecipeCategory[];
  tags: PublicRecipeTag[];
  totalCount: number;
  heroCount: number;
  totalPages: number;
  query: PublicRecipeListingQuery;
  category: PublicRecipeCategory | null;
};

type MediaPreview = {
  url: string | null;
  alt: string | null;
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function fetchCoverMediaMap(
  mediaIds: string[]
): Promise<Map<string, MediaPreview>> {
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
      row.id as string,
      {
        url: getPublicMediaUrl(row.storage_path as string),
        alt: (row.alt_text as string | null) ?? null,
      },
    ])
  );
}

async function fetchCategoryMap(
  categoryIds: string[]
): Promise<Map<string, PublicRecipeCategory>> {
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
      row.id as string,
      {
        id: row.id as string,
        name: row.name as string,
        slug: row.slug as string,
      },
    ])
  );
}

export async function getPublicRecipeCategories(): Promise<
  PublicRecipeCategory[]
> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("type", "recipe")
      .order("name", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
    }));
  } catch {
    return [];
  }
}

export async function getPublicRecipeTags(): Promise<PublicRecipeTag[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("id, name, slug")
      .eq("type", "recipe")
      .order("name", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
    }));
  } catch {
    return [];
  }
}

export async function getPublicRecipeCategoryBySlug(
  slug: string
): Promise<PublicRecipeCategory | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalized = normalizeRouteSlug(slug);

  if (!normalized) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("type", "recipe")
      .eq("slug", normalized)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id as string,
      name: data.name as string,
      slug: data.slug as string,
    };
  } catch {
    return null;
  }
}

export async function getPublicRecipeListing(options: {
  categorySlug?: string | null;
  query: PublicRecipeListingQuery;
}): Promise<PublicRecipeListingResult> {
  const empty: PublicRecipeListingResult = {
    recipes: [],
    categories: [],
    tags: [],
    totalCount: 0,
    heroCount: 0,
    totalPages: 1,
    query: options.query,
    category: null,
  };

  if (!isSupabaseConfigured()) {
    return empty;
  }

  try {
    const supabase = await createClient();
    const [categories, tags] = await Promise.all([
      getPublicRecipeCategories(),
      getPublicRecipeTags(),
    ]);

    let category: PublicRecipeCategory | null = null;
    const categorySlug = options.categorySlug?.trim();

    if (categorySlug) {
      category =
        categories.find((item) => item.slug === categorySlug) ??
        (await getPublicRecipeCategoryBySlug(categorySlug));

      if (!category) {
        return {
          ...empty,
          categories,
          tags,
        };
      }
    }

    let heroCountQuery = supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    if (category) {
      heroCountQuery = heroCountQuery.eq("category_id", category.id);
    }

    const { count: heroCountValue } = await heroCountQuery;
    const heroCount = heroCountValue ?? 0;

    let recipeIdsForTag: string[] | null = null;
    const tagFilter = options.query.tag.trim();
    const tagSlugs =
      tagFilter && tagFilter !== "all"
        ? [
            ...new Set(
              tagFilter
                .split(",")
                .map((part) => part.trim())
                .filter((part) => part.length > 0 && part !== "all")
            ),
          ]
        : [];

    if (tagSlugs.length > 0) {
      const matchedTagIds = tags
        .filter(
          (tag) => tagSlugs.includes(tag.slug) || tagSlugs.includes(tag.id)
        )
        .map((tag) => tag.id);

      if (matchedTagIds.length === 0) {
        return {
          ...empty,
          categories,
          tags,
          category,
          heroCount,
          query: options.query,
        };
      }

      const { data: tagRows, error: tagError } = await supabase
        .from("recipe_tags")
        .select("recipe_id")
        .in("tag_id", matchedTagIds);

      if (tagError) {
        return {
          ...empty,
          categories,
          tags,
          category,
          heroCount,
        };
      }

      recipeIdsForTag = [
        ...new Set((tagRows ?? []).map((row) => row.recipe_id as string)),
      ];

      if (recipeIdsForTag.length === 0) {
        return {
          ...empty,
          categories,
          tags,
          category,
          heroCount,
          query: options.query,
        };
      }
    }

    const from = (options.query.page - 1) * PUBLIC_RECIPES_PAGE_SIZE;
    const to = from + PUBLIC_RECIPES_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("recipes")
      .select(RECIPE_PUBLIC_COLUMNS, { count: "exact" })
      .eq("status", "published");

    if (category) {
      listQuery = listQuery.eq("category_id", category.id);
    }

    if (options.query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(options.query.q)}%`;
      listQuery = listQuery.ilike("title", pattern);
    }

    if (recipeIdsForTag) {
      listQuery = listQuery.in("id", recipeIdsForTag);
    }

    if (options.query.sort === "oldest") {
      listQuery = listQuery.order("published_at", {
        ascending: true,
        nullsFirst: false,
      });
    } else if (options.query.sort === "title") {
      listQuery = listQuery.order("title", { ascending: true });
    } else {
      listQuery = listQuery.order("published_at", {
        ascending: false,
        nullsFirst: false,
      });
    }

    const { data, error, count } = await listQuery.range(from, to);

    if (error || !data) {
      return {
        ...empty,
        categories,
        tags,
        category,
        heroCount,
      };
    }

    const mediaMap = await fetchCoverMediaMap(
      data.map((row) => row.cover_media_id as string)
    );
    const categoryMap = await fetchCategoryMap(
      data.map((row) => row.category_id as string)
    );

    const totalCount = count ?? 0;
    const recipes: PublicRecipeSummary[] = data.map((row) => {
      const cover = mediaMap.get(row.cover_media_id as string);
      const recipeCategory = categoryMap.get(row.category_id as string);

      return {
        id: row.id as string,
        title: row.title as string,
        card_title: (row.card_title as string | null) ?? null,
        slug: row.slug as string,
        description: row.description as string,
        coverUrl: cover?.url ?? null,
        coverAlt: cover?.alt ?? null,
        categoryName: recipeCategory?.name ?? null,
        categorySlug: recipeCategory?.slug ?? null,
        prep_duration: row.prep_duration as string,
        servings: row.servings as string,
        featured: Boolean(row.featured),
        published_at: (row.published_at as string | null) ?? null,
      };
    });

    return {
      recipes,
      categories,
      tags,
      totalCount,
      heroCount,
      totalPages: Math.max(1, Math.ceil(totalCount / PUBLIC_RECIPES_PAGE_SIZE)),
      query: options.query,
      category,
    };
  } catch {
    return empty;
  }
}
