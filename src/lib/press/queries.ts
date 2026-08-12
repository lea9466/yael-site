import "server-only";

import {
  createPublicClient,
  isSupabaseConfigured,
} from "@/lib/auth/session";
import { MEDIA_LIBRARY_SELECT_COLUMNS, PDF_MIME_TYPE } from "@/lib/media/constants";
import { isPdfMimeType } from "@/lib/media/mime";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { PRESS_PAGE_SIZE } from "@/lib/press/constants";
import type {
  PressArticleDetail,
  PressArticleListItem,
  PressArticlePublicCard,
  PressArticlePublicDetail,
  PressArticleRecord,
  PressArticlesListData,
  PressMediaPreview,
} from "@/lib/press/types";
import type {
  ListPressArticlesQuery,
  PressSortValue,
} from "@/lib/validations/press-article";

const PRESS_SELECT_COLUMNS =
  "id, title, slug, excerpt, publication_name, published_at, pdf_media_id, display_order, status, seo_title, seo_description, created_at, updated_at";

type SortConfig = {
  column: "display_order" | "published_at" | "title" | "updated_at" | "created_at";
  ascending: boolean;
  nullsFirst?: boolean;
};

const SORT_CONFIG: Record<PressSortValue, SortConfig> = {
  display_order: { column: "display_order", ascending: true },
  newest: { column: "published_at", ascending: false },
  oldest: { column: "published_at", ascending: true },
  title: { column: "title", ascending: true },
  updated: { column: "updated_at", ascending: false },
};

type MediaJoinRow = {
  id: string;
  storage_path: string;
  file_name: string;
  original_file_name: string | null;
  mime_type: string;
  size_bytes: number;
  alt_text: string | null;
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function toMediaPreview(row: MediaJoinRow | null): PressMediaPreview | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    url: getPublicMediaUrl(row.storage_path) ?? "",
    alt: row.alt_text ?? row.original_file_name ?? row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
  };
}

function asPressRecord(row: Record<string, unknown>): PressArticleRecord {
  return row as unknown as PressArticleRecord;
}

export async function isPressSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  if (!slug || !isSupabaseConfigured()) {
    return false;
  }

  const supabase = createPublicClient();
  let query = supabase
    .from("press_articles")
    .select("id")
    .eq("slug", slug)
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    return true;
  }

  return (data?.length ?? 0) > 0;
}

export async function verifyMediaExists(mediaId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("media_library")
    .select("id")
    .eq("id", mediaId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function verifyMediaMime(
  mediaId: string,
  kind: "pdf"
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("media_library")
    .select("mime_type")
    .eq("id", mediaId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  if (kind === "pdf") {
    return isPdfMimeType(data.mime_type) || data.mime_type === PDF_MIME_TYPE;
  }

  return false;
}

export async function fetchPressArticlesList(
  query: ListPressArticlesQuery
): Promise<PressArticlesListData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = createPublicClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * PRESS_PAGE_SIZE;
    const to = from + PRESS_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("press_articles")
      .select(PRESS_SELECT_COLUMNS, { count: "exact" });

    if (query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(query.q)}%`;
      listQuery = listQuery.or(
        `title.ilike."${pattern}",publication_name.ilike."${pattern}",excerpt.ilike."${pattern}"`
      );
    }

    if (query.status !== "all") {
      listQuery = listQuery.eq("status", query.status);
    }

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return null;
    }

    const [publishedResult, draftResult, totalResult] = await Promise.all([
      supabase
        .from("press_articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("press_articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("press_articles")
        .select("*", { count: "exact", head: true }),
    ]);

    const items: PressArticleListItem[] = (data ?? []).map((row) =>
      asPressRecord(row)
    );

    const filteredCount = count ?? 0;

    return {
      items,
      query,
      pagination: {
        page: query.page,
        totalPages: Math.max(1, Math.ceil(filteredCount / PRESS_PAGE_SIZE)),
        totalCount: filteredCount,
      },
      stats: {
        totalCount: totalResult.count ?? 0,
        publishedCount: publishedResult.count ?? 0,
        draftCount: draftResult.count ?? 0,
      },
    };
  } catch {
    return null;
  }
}

export async function fetchPressArticleById(
  id: string
): Promise<PressArticleDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("press_articles")
      .select(
        `${PRESS_SELECT_COLUMNS}, pdf:media_library!press_articles_pdf_media_id_fkey(${MEDIA_LIBRARY_SELECT_COLUMNS})`
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = asPressRecord(data);
    const pdfRaw = data.pdf as MediaJoinRow | MediaJoinRow[] | null;

    return {
      ...record,
      pdfPreview: toMediaPreview(
        Array.isArray(pdfRaw) ? (pdfRaw[0] ?? null) : pdfRaw
      ),
    };
  } catch {
    return null;
  }
}

export async function fetchPublishedPressArticles(): Promise<
  PressArticlePublicCard[]
> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("press_articles")
      .select(PRESS_SELECT_COLUMNS)
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => {
      const record = asPressRecord(row);

      return {
        id: record.id,
        title: record.title,
        slug: record.slug,
        excerpt: record.excerpt,
        publication_name: record.publication_name,
        published_at: record.published_at ?? record.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchPublishedPressArticleBySlug(
  slug: string
): Promise<PressArticlePublicDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("press_articles")
      .select(
        `${PRESS_SELECT_COLUMNS}, pdf:media_library!press_articles_pdf_media_id_fkey(${MEDIA_LIBRARY_SELECT_COLUMNS})`
      )
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = asPressRecord(data);
    const pdfRaw = data.pdf as MediaJoinRow | MediaJoinRow[] | null;
    const pdf = toMediaPreview(
      Array.isArray(pdfRaw) ? (pdfRaw[0] ?? null) : pdfRaw
    );

    if (!pdf?.url) {
      return null;
    }

    return {
      id: record.id,
      title: record.title,
      slug: record.slug,
      excerpt: record.excerpt,
      publication_name: record.publication_name,
      published_at: record.published_at ?? record.created_at,
      pdfUrl: pdf.url,
      seo_title: record.seo_title,
      seo_description: record.seo_description,
      updated_at: record.updated_at,
    };
  } catch {
    return null;
  }
}

export async function hasPublishedPressArticles(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = createPublicClient();
    const { count, error } = await supabase
      .from("press_articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (error) {
      return false;
    }

    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function fetchPublishedPressSlugs(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("press_articles")
      .select("slug, updated_at")
      .eq("status", "published");

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}
