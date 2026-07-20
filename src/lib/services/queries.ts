import { createClient } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { normalizeServiceContent } from "@/lib/services/content";
import { SERVICES_PAGE_SIZE } from "@/lib/services/constants";
import type {
  ServiceDetail,
  ServiceListItem,
  ServiceRecord,
  ServicesListData,
} from "@/lib/services/types";
import type { ListServicesQuery, ServiceSortValue } from "@/lib/validations/service";

const SERVICE_SELECT_COLUMNS =
  "id, title, slug, short_description, full_introduction, cover_media_id, seo_og_media_id, content, seo, featured, status, published_at, created_at, updated_at";

type SortConfig = {
  column: "created_at" | "updated_at" | "title";
  ascending: boolean;
};

const SORT_CONFIG: Record<ServiceSortValue, SortConfig> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  title: { column: "title", ascending: true },
  updated: { column: "updated_at", ascending: false },
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
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

function toServiceListItem(
  record: ServiceRecord,
  mediaMap: Map<string, MediaJoinRow>
): ServiceListItem {
  const cover = mediaMap.get(record.cover_media_id);

  return {
    ...record,
    coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
    coverAlt: cover?.alt_text ?? null,
  };
}

export async function fetchServicesList(
  query: ListServicesQuery
): Promise<ServicesListData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * SERVICES_PAGE_SIZE;
    const to = from + SERVICES_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("services")
      .select(SERVICE_SELECT_COLUMNS, { count: "exact" });

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

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    if (error) {
      return null;
    }

    const records = (data ?? []) as ServiceRecord[];
    const mediaMap = await fetchMediaMap(
      records.map((record) => record.cover_media_id)
    );

    const filteredCount = count ?? 0;

    return {
      items: records.map((record) => toServiceListItem(record, mediaMap)),
      pagination: {
        page: query.page,
        pageSize: SERVICES_PAGE_SIZE,
        totalCount: filteredCount,
        totalPages: Math.max(1, Math.ceil(filteredCount / SERVICES_PAGE_SIZE)),
      },
      query: {
        q: query.q,
        status: query.status,
        featured: query.featured,
        sort: query.sort,
        page: query.page,
      },
    };
  } catch {
    return null;
  }
}

export async function fetchServiceById(
  id: string
): Promise<ServiceDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select(SERVICE_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = data as ServiceRecord;
    const mediaIds = [record.cover_media_id];

    if (record.seo_og_media_id) {
      mediaIds.push(record.seo_og_media_id);
    }

    const mediaMap = await fetchMediaMap(mediaIds);
    const cover = mediaMap.get(record.cover_media_id);
    const og = record.seo_og_media_id
      ? mediaMap.get(record.seo_og_media_id)
      : undefined;

    return {
      ...record,
      content: normalizeServiceContent(record.content),
      coverUrl: cover ? getPublicMediaUrl(cover.storage_path) : null,
      coverAlt: cover?.alt_text ?? null,
      ogUrl: og ? getPublicMediaUrl(og.storage_path) : null,
      ogAlt: og?.alt_text ?? null,
    };
  } catch {
    return null;
  }
}

export async function isServiceSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from("services").select("id").eq("slug", slug);

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
