import { createClient } from "@/lib/auth/session";
import { TAGS_PAGE_SIZE } from "@/lib/tags/constants";
import type { TagType } from "@/lib/tags/constants";
import type {
  TagListItem,
  TagRecord,
  TagsListData,
  TagUsageBreakdown,
} from "@/lib/tags/types";
import type { ListTagsQuery, TagSortValue } from "@/lib/validations/tag";

type SortConfig = {
  column: "created_at" | "name";
  ascending: boolean;
};

const SORT_CONFIG: Record<TagSortValue, SortConfig> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  name: { column: "name", ascending: true },
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function fetchUsageCounts(
  records: TagRecord[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (records.length === 0) {
    return counts;
  }

  const supabase = await createClient();
  const recipeTagIds = records
    .filter((record) => record.type === "recipe")
    .map((record) => record.id);
  const articleTagIds = records
    .filter((record) => record.type === "article")
    .map((record) => record.id);

  if (recipeTagIds.length > 0) {
    const { data, error } = await supabase
      .from("recipe_tags")
      .select("tag_id")
      .in("tag_id", recipeTagIds);

    if (!error && data) {
      for (const row of data) {
        counts.set(row.tag_id, (counts.get(row.tag_id) ?? 0) + 1);
      }
    }
  }

  if (articleTagIds.length > 0) {
    const { data, error } = await supabase
      .from("article_tags")
      .select("tag_id")
      .in("tag_id", articleTagIds);

    if (!error && data) {
      for (const row of data) {
        counts.set(row.tag_id, (counts.get(row.tag_id) ?? 0) + 1);
      }
    }
  }

  return counts;
}

function toTagListItem(
  record: TagRecord,
  usageCounts: Map<string, number>
): TagListItem {
  return {
    ...record,
    usageCount: usageCounts.get(record.id) ?? 0,
  };
}

export async function fetchTagsList(
  query: ListTagsQuery
): Promise<TagsListData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * TAGS_PAGE_SIZE;
    const to = from + TAGS_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("tags")
      .select("id, type, name, slug, created_at", { count: "exact" });

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

    const records = (data ?? []) as TagRecord[];
    const usageCounts = await fetchUsageCounts(records);
    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / TAGS_PAGE_SIZE));

    return {
      items: records.map((record) => toTagListItem(record, usageCounts)),
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

export async function fetchTagById(id: string): Promise<TagListItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("id, type, name, slug, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = data as TagRecord;
    const usageCounts = await fetchUsageCounts([record]);

    return toTagListItem(record, usageCounts);
  } catch {
    return null;
  }
}

export async function getTagUsageBreakdown(
  id: string
): Promise<TagUsageBreakdown> {
  const supabase = await createClient();

  const [recipeResult, articleResult] = await Promise.all([
    supabase
      .from("recipe_tags")
      .select("tag_id", { count: "exact", head: true })
      .eq("tag_id", id),
    supabase
      .from("article_tags")
      .select("tag_id", { count: "exact", head: true })
      .eq("tag_id", id),
  ]);

  const recipeCount = recipeResult.error ? 0 : recipeResult.count ?? 0;
  const articleCount = articleResult.error ? 0 : articleResult.count ?? 0;

  return {
    recipeCount,
    articleCount,
    total: recipeCount + articleCount,
  };
}

export async function isTagSlugTaken(
  slug: string,
  type: TagType,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("tags")
    .select("id")
    .eq("type", type)
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  return !error && (data?.length ?? 0) > 0;
}

export async function isTagNameTaken(
  name: string,
  type: TagType,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("tags")
    .select("id")
    .eq("type", type)
    .eq("name", name);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  return !error && (data?.length ?? 0) > 0;
}
