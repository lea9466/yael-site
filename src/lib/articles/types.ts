import type { StoredSeo } from "@/lib/seo/types";
import type { ContentStatus } from "@/types/content";
import type {
  ArticleFeaturedFilter,
  ArticleSortValue,
  ArticleStatusFilter,
} from "@/lib/validations/article";

export type ArticleTextMark = {
  type: "bold" | "italic" | "link";
  start: number;
  end: number;
  href?: string;
};

export type ArticleParagraphBlock = {
  type: "paragraph";
  text: string;
  marks?: ArticleTextMark[];
};

export type ArticleHeadingBlock = {
  type: "heading";
  level: 2 | 3;
  text: string;
  marks?: ArticleTextMark[];
};

export type ArticleQuoteBlock = {
  type: "quote";
  text: string;
  marks?: ArticleTextMark[];
};

export type ArticleListBlockItem = {
  text: string;
  marks?: ArticleTextMark[];
};

export type ArticleListBlock = {
  type: "list";
  list_type: "bullet" | "ordered";
  items: ArticleListBlockItem[];
};

export type ArticleImageBlock = {
  type: "image";
  media_id: string;
  caption: string | null;
};

export type ArticleBlock =
  | ArticleParagraphBlock
  | ArticleHeadingBlock
  | ArticleQuoteBlock
  | ArticleListBlock
  | ArticleImageBlock;

export type ArticleGalleryItem = {
  media_id: string;
  order: number;
};

export type ArticleContent = {
  blocks: ArticleBlock[];
  gallery: ArticleGalleryItem[];
};

export type ArticleSeo = StoredSeo;

export type ArticleRecord = {
  id: string;
  title: string;
  slug: string;
  body: string;
  cover_media_id: string;
  seo_og_media_id: string | null;
  category_id: string;
  reading_time_minutes: number;
  content: ArticleContent;
  seo: ArticleSeo;
  featured: boolean;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleTagSummary = {
  id: string;
  name: string;
};

export type ArticleCategorySummary = {
  id: string;
  name: string;
  slug?: string;
};

export type ArticleListItem = ArticleRecord & {
  coverUrl: string | null;
  coverAlt: string | null;
  categoryName: string | null;
  tagNames: string[];
};

export type ArticleDetail = ArticleRecord & {
  coverUrl: string | null;
  coverAlt: string | null;
  ogUrl: string | null;
  ogAlt: string | null;
  category: ArticleCategorySummary | null;
  tags: ArticleTagSummary[];
  galleryUrls: Array<{
    media_id: string;
    order: number;
    url: string | null;
    alt: string | null;
  }>;
  blockMediaUrls: Map<string, { url: string | null; alt: string | null }>;
};

export type ArticlesListData = {
  items: ArticleListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  query: {
    q: string;
    status: ArticleStatusFilter;
    featured: ArticleFeaturedFilter;
    category: string;
    tag: string;
    sort: ArticleSortValue;
    page: number;
  };
  categories: ArticleCategorySummary[];
  tags: ArticleTagSummary[];
};

export type ArticleActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
