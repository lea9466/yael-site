import type { PressStatus } from "@/lib/press/constants";
import type { ListPressArticlesQuery } from "@/lib/validations/press-article";

export type PressArticleRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publication_name: string;
  published_at: string | null;
  cover_media_id: string | null;
  pdf_media_id: string | null;
  display_order: number;
  status: PressStatus;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type PressMediaPreview = {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  sizeBytes: number;
};

export type PressArticleListItem = PressArticleRecord & {
  coverUrl: string | null;
  coverAlt: string | null;
};

export type PressArticleDetail = PressArticleRecord & {
  coverPreview: PressMediaPreview | null;
  pdfPreview: PressMediaPreview | null;
};

export type PressArticlesListData = {
  items: PressArticleListItem[];
  query: ListPressArticlesQuery;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
  stats: {
    totalCount: number;
    publishedCount: number;
    draftCount: number;
  };
};

export type PressArticlePublicCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publication_name: string;
  published_at: string;
  coverUrl: string | null;
  coverAlt: string | null;
};

export type PressArticlePublicDetail = PressArticlePublicCard & {
  pdfUrl: string;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

export type PressArticleFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  publication_name: string;
  published_at: string;
  cover_media_id: string | null;
  pdf_media_id: string | null;
  display_order: number;
  status: PressStatus;
  seo_title: string;
  seo_description: string;
};

export type PressArticleActionResult =
  | { success: true; data?: { id: string } }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };
