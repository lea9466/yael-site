import {
  createDefaultArticleContent,
  createDefaultArticleSeo,
} from "@/lib/articles/content";
import type { ArticleDetail } from "@/lib/articles/types";
import type { ArticleDraftInput } from "@/lib/validations/article";

export function articleDetailToFormInput(
  article: ArticleDetail
): ArticleDraftInput {
  return {
    title: article.title,
    slug: article.slug,
    cover_media_id: article.cover_media_id,
    seo_og_media_id: article.seo_og_media_id,
    category_id: article.category_id,
    featured: article.featured,
    status: article.status,
    tag_ids: article.tags.map((tag) => tag.id),
    content: article.content ?? createDefaultArticleContent(),
    seo: article.seo ?? createDefaultArticleSeo(),
  };
}

export function createEmptyArticleFormInput(
  categoryId?: string
): ArticleDraftInput {
  return {
    title: "",
    slug: "",
    cover_media_id: null,
    seo_og_media_id: null,
    category_id: categoryId ?? "",
    featured: false,
    status: "draft",
    tag_ids: [],
    content: createDefaultArticleContent(),
    seo: createDefaultArticleSeo(),
  };
}
