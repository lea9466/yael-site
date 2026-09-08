import { createClient, isSupabaseConfigured } from "@/lib/auth/session";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { shortenForSeoDescription } from "@/lib/seo/resolve";
import type { PublicPostSummary } from "@/lib/public/types";
import {
  PUBLIC_BLOG_PAGE_SIZE,
  type PublicBlogListingQuery,
} from "@/lib/validations/public-blog-listing";

const ARTICLE_PUBLIC_COLUMNS =
  "id, title, card_title, slug, body, cover_media_id, reading_time_minutes, featured, published_at, updated_at";

export type PublicBlogTag = {
  id: string;
  name: string;
  slug: string;
};

export type PublicBlogListingResult = {
  posts: PublicPostSummary[];
  tags: PublicBlogTag[];
  totalCount: number;
  heroCount: number;
  totalPages: number;
  query: PublicBlogListingQuery;
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

export async function getPublicBlogTags(): Promise<PublicBlogTag[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("id, name, slug")
      .eq("type", "article")
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

export async function getPublicBlogListing(options: {
  query: PublicBlogListingQuery;
}): Promise<PublicBlogListingResult> {
  const empty: PublicBlogListingResult = {
    posts: [],
    tags: [],
    totalCount: 0,
    heroCount: 0,
    totalPages: 1,
    query: options.query,
  };

  if (!isSupabaseConfigured()) {
    return empty;
  }

  try {
    const supabase = await createClient();
    const tags = await getPublicBlogTags();

    const { count: heroCountValue } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    const heroCount = heroCountValue ?? 0;

    let articleIdsForTag: string[] | null = null;
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
          tags,
          heroCount,
          query: options.query,
        };
      }

      const { data: tagRows, error: tagError } = await supabase
        .from("article_tags")
        .select("article_id")
        .in("tag_id", matchedTagIds);

      if (tagError) {
        return {
          ...empty,
          tags,
          heroCount,
        };
      }

      articleIdsForTag = [
        ...new Set((tagRows ?? []).map((row) => row.article_id as string)),
      ];

      if (articleIdsForTag.length === 0) {
        return {
          ...empty,
          tags,
          heroCount,
          query: options.query,
        };
      }
    }

    const from = (options.query.page - 1) * PUBLIC_BLOG_PAGE_SIZE;
    const to = from + PUBLIC_BLOG_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("articles")
      .select(ARTICLE_PUBLIC_COLUMNS, { count: "exact" })
      .eq("status", "published");

    if (options.query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(options.query.q)}%`;
      // Title + SEO description (editable summary). Rich `content` JSON is not searched.
      listQuery = listQuery.or(
        `title.ilike.${JSON.stringify(pattern)},seo->>description.ilike.${JSON.stringify(pattern)}`
      );
    }

    if (articleIdsForTag) {
      listQuery = listQuery.in("id", articleIdsForTag);
    }

    if (options.query.sort === "oldest") {
      listQuery = listQuery.order("published_at", {
        ascending: true,
        nullsFirst: false,
      });
    } else if (options.query.sort === "title") {
      listQuery = listQuery.order("title", { ascending: true });
    } else {
      listQuery = listQuery
        .order("featured", { ascending: false })
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        });
    }

    const { data, error, count } = await listQuery.range(from, to);

    if (error || !data) {
      return {
        ...empty,
        tags,
        heroCount,
      };
    }

    const mediaMap = await fetchCoverMediaMap(
      data.map((row) => row.cover_media_id as string)
    );

    const totalCount = count ?? 0;
    const posts: PublicPostSummary[] = data.map((row) => {
      const cover = mediaMap.get(row.cover_media_id as string);

      return {
        id: row.id as string,
        title: row.title as string,
        card_title: (row.card_title as string | null) ?? null,
        slug: row.slug as string,
        excerpt: shortenForSeoDescription(row.body as string, 180),
        coverUrl: cover?.url ?? null,
        coverAlt: cover?.alt ?? null,
        reading_time_minutes: row.reading_time_minutes as number,
        featured: Boolean(row.featured),
        published_at: (row.published_at as string | null) ?? null,
      };
    });

    return {
      posts,
      tags,
      totalCount,
      heroCount,
      totalPages: Math.max(1, Math.ceil(totalCount / PUBLIC_BLOG_PAGE_SIZE)),
      query: options.query,
    };
  } catch {
    return empty;
  }
}
