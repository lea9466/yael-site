import { createClient } from "@/lib/auth/session";
import { CATEGORIES_PAGE_SIZE } from "@/lib/categories/constants";
import type { CategoryType } from "@/lib/categories/constants";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import type {
  CategoriesListData,
  CategoryListItem,
  CategoryRecord,
} from "@/lib/categories/types";
import type {
  CategorySortValue,
  ListCategoriesQuery,
} from "@/lib/validations/category";

type SortConfig = {
  column: "created_at" | "name";
  ascending: boolean;
};

const SORT_CONFIG: Record<CategorySortValue, SortConfig> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  name: { column: "name", ascending: true },
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function fetchUsageCounts(
  records: CategoryRecord[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (records.length === 0) {
    return counts;
  }

  const supabase = await createClient();
  const recipeIds = records
    .filter((record) => record.type === "recipe")
    .map((record) => record.id);
  const articleIds = records
    .filter((record) => record.type === "article")
    .map((record) => record.id);

  if (recipeIds.length > 0) {
    const { data, error } = await supabase
      .from("recipes")
      .select("category_id")
      .in("category_id", recipeIds);

    if (!error && data) {
      for (const row of data) {
        counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
      }
    }
  }

  if (articleIds.length > 0) {
    const { data, error } = await supabase
      .from("articles")
      .select("category_id")
      .in("category_id", articleIds);

    if (!error && data) {
      for (const row of data) {
        counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
      }
    }
  }

  return counts;
}

type MediaJoinRow = {
  storage_path: string;
  alt_text: string | null;
};

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

function toCategoryListItem(
  record: CategoryRecord,
  usageCounts: Map<string, number>,
  mediaMap: Map<string, MediaJoinRow>
): CategoryListItem {
  const image = record.image_media_id
    ? mediaMap.get(record.image_media_id)
    : undefined;

  return {
    ...record,
    usageCount: usageCounts.get(record.id) ?? 0,
    imageUrl: image ? getPublicMediaUrl(image.storage_path) : null,
    imageAlt: image?.alt_text ?? null,
  };
}

export async function fetchCategoriesList(
  query: ListCategoriesQuery
): Promise<CategoriesListData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * CATEGORIES_PAGE_SIZE;
    const to = from + CATEGORIES_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("categories")
      .select("id, type, name, slug, image_media_id, created_at", {
        count: "exact",
      });

    if (query.type !== "all") {
      listQuery = listQuery.eq("type", query.type);
    }

    if (query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(query.q)}%`;
      listQuery = listQuery.or(`name.ilike.${pattern},slug.ilike.${pattern}`);
    }

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    if (error) {
      return null;
    }

    const records = (data ?? []) as CategoryRecord[];
    const usageCounts = await fetchUsageCounts(records);
    const mediaMap = await fetchMediaMap(
      records
        .map((record) => record.image_media_id)
        .filter((id): id is string => Boolean(id))
    );
    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / CATEGORIES_PAGE_SIZE));

    return {
      items: records.map((record) =>
        toCategoryListItem(record, usageCounts, mediaMap)
      ),
      query,
      pagination: {
        page: query.page,
        totalPages,
        totalCount,
      },
    };
  } catch {
    return null;
  }
}

export async function fetchCategoryById(
  id: string
): Promise<CategoryListItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, type, name, slug, image_media_id, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = data as CategoryRecord;
    const usageCounts = await fetchUsageCounts([record]);
    const mediaMap = await fetchMediaMap(
      record.image_media_id ? [record.image_media_id] : []
    );

    return toCategoryListItem(record, usageCounts, mediaMap);
  } catch {
    return null;
  }
}

export async function getCategoryUsageCount(
  id: string,
  type: CategoryType
): Promise<number> {
  const supabase = await createClient();
  const table = type === "recipe" ? "recipes" : "articles";
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function isCategorySlugTaken(
  slug: string,
  type: CategoryType,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id")
    .eq("type", type)
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  return !error && (data?.length ?? 0) > 0;
}

export async function isCategoryNameTaken(
  name: string,
  type: CategoryType,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id")
    .eq("type", type)
    .eq("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  return !error && (data?.length ?? 0) > 0;
}
