import {
  fromDateInputValue,
  toDateInputValue,
} from "@/lib/press/date";
import type {
  PressArticleDetail,
  PressArticleFormValues,
} from "@/lib/press/types";

export function createEmptyPressFormValues(): PressArticleFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    publication_name: "",
    published_at: "",
    cover_media_id: null,
    pdf_media_id: null,
    display_order: 0,
    status: "draft",
    seo_title: "",
    seo_description: "",
  };
}

export function pressArticleToFormValues(
  article: PressArticleDetail
): PressArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    publication_name: article.publication_name,
    published_at: toDateInputValue(article.published_at),
    cover_media_id: article.cover_media_id,
    pdf_media_id: article.pdf_media_id,
    display_order: article.display_order,
    status: article.status,
    seo_title: article.seo_title ?? "",
    seo_description: article.seo_description ?? "",
  };
}

export function normalizePressFormForSave(values: PressArticleFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    excerpt: values.excerpt.trim(),
    publication_name: values.publication_name.trim(),
    published_at: fromDateInputValue(values.published_at),
    cover_media_id: values.cover_media_id,
    pdf_media_id: values.pdf_media_id,
    display_order: values.display_order,
    status: values.status,
    seo_title: values.seo_title.trim(),
    seo_description: values.seo_description.trim(),
  };
}
