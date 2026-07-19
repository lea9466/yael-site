import { createClient } from "@/lib/auth/session";
import { MEDIA_LIBRARY_SELECT_COLUMNS } from "@/lib/media/constants";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import type { MediaLibraryData, MediaListItem, MediaRecord } from "@/lib/media/media-types";
import {
  MEDIA_PAGE_SIZE,
  type ListMediaQuery,
  type MediaSortValue,
} from "@/lib/validations/media";

const MEDIA_SELECT_COLUMNS = MEDIA_LIBRARY_SELECT_COLUMNS;

type SortConfig = {
  column: "created_at" | "original_file_name" | "size_bytes";
  ascending: boolean;
};

const SORT_CONFIG: Record<MediaSortValue, SortConfig> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  filename: { column: "original_file_name", ascending: true },
  size: { column: "size_bytes", ascending: false },
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function toMediaListItem(record: MediaRecord): MediaListItem {
  return {
    ...record,
    publicUrl: getPublicMediaUrl(record.storage_path),
  };
}

export async function fetchMediaLibrary(
  query: ListMediaQuery
): Promise<MediaLibraryData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * MEDIA_PAGE_SIZE;
    const to = from + MEDIA_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("media_library")
      .select(MEDIA_SELECT_COLUMNS, { count: "exact" });

    if (query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(query.q)}%`;
      listQuery = listQuery.or(
        `original_file_name.ilike."${pattern}",alt_text.ilike."${pattern}"`
      );
    }

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    if (error) {
      return null;
    }

    const { count: globalCount, error: globalCountError } = await supabase
      .from("media_library")
      .select("*", { count: "exact", head: true });

    const { data: sizeRows, error: statsError } = await supabase
      .from("media_library")
      .select("size_bytes");

    if (statsError || globalCountError) {
      return null;
    }

    const filteredCount = count ?? 0;
    const totalSizeBytes =
      sizeRows?.reduce((sum, row) => sum + row.size_bytes, 0) ?? 0;

    const items = (data ?? []).map((row) =>
      toMediaListItem(row as MediaRecord)
    );

    return {
      items,
      stats: {
        totalCount: globalCount ?? 0,
        totalSizeBytes,
      },
      pagination: {
        page: query.page,
        pageSize: MEDIA_PAGE_SIZE,
        totalCount: filteredCount,
        totalPages: Math.max(1, Math.ceil(filteredCount / MEDIA_PAGE_SIZE)),
      },
      query: {
        q: query.q,
        sort: query.sort,
        page: query.page,
      },
    };
  } catch {
    return null;
  }
}
