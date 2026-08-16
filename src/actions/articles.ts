"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import {
  buildArticleBody,
  toArticleContentForSave,
} from "@/lib/articles/content";
import { ARTICLE_ERRORS } from "@/lib/articles/errors";
import {
  fetchArticleById,
  isArticleSlugTaken,
  verifyMediaExists,
} from "@/lib/articles/queries";
import { calculateReadingTimeMinutes } from "@/lib/articles/reading-time";
import {
  buildDuplicateSlugBase,
  buildDuplicateTitle,
  buildUniqueArticleSlug,
} from "@/lib/articles/slug";
import type { ArticleActionResult, ArticleBlock } from "@/lib/articles/types";
import { verifyArticleTags } from "@/lib/taxonomy/queries";
import { normalizeStoredSeoForSave } from "@/lib/seo/resolve";
import {
  archiveArticleSchema,
  createArticleSchema,
  duplicateArticleSchema,
  mapZodErrors,
  permanentlyDeleteArticleSchema,
  publishArticleSchema,
  quickPublishArticleSchema,
  articlePublishInputSchema,
  unpublishArticleSchema,
  updateArticleSchema,
  type ArticleDraftInput,
  type ArticlePublishInput,
} from "@/lib/validations/article";

async function getAdminSupabase(): Promise<{
  supabase: SupabaseClient;
} | null> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const supabase = await createClient();

  return { supabase };
}

function revalidateArticlePaths(articleId?: string) {
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  revalidatePath("/blog", "layout");
  revalidatePath("/");

  if (articleId) {
    revalidatePath(`/admin/articles/${articleId}`);
    revalidatePath(`/admin/articles/${articleId}/preview`);
  }
}

function collectContentMediaIds(blocks: ArticleBlock[], galleryIds: string[]) {
  const blockMediaIds = blocks
    .filter((block) => block.type === "image")
    .map((block) => block.media_id);

  return [...galleryIds, ...blockMediaIds];
}

async function validateMediaIds(
  coverMediaId: string | null,
  ogMediaId: string | null,
  contentMediaIds: string[],
  requireCover: boolean
): Promise<ArticleActionResult> {
  if (requireCover && !coverMediaId) {
    return {
      success: false,
      error: ARTICLE_ERRORS.coverRequiredPublish,
      fieldErrors: { cover_media_id: ARTICLE_ERRORS.coverRequiredPublish },
    };
  }

  if (coverMediaId) {
    const coverExists = await verifyMediaExists(coverMediaId);

    if (!coverExists) {
      return {
        success: false,
        error: ARTICLE_ERRORS.mediaNotFound,
        fieldErrors: { cover_media_id: ARTICLE_ERRORS.mediaNotFound },
      };
    }
  }

  if (ogMediaId) {
    const ogExists = await verifyMediaExists(ogMediaId);

    if (!ogExists) {
      return {
        success: false,
        error: ARTICLE_ERRORS.mediaNotFound,
        fieldErrors: { seo_og_media_id: ARTICLE_ERRORS.mediaNotFound },
      };
    }
  }

  for (const mediaId of contentMediaIds) {
    const exists = await verifyMediaExists(mediaId);

    if (!exists) {
      return {
        success: false,
        error: ARTICLE_ERRORS.mediaNotFound,
        fieldErrors: { "content.blocks": ARTICLE_ERRORS.mediaNotFound },
      };
    }
  }

  return { success: true };
}

async function validateSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<ArticleActionResult> {
  const taken = await isArticleSlugTaken(slug, excludeId);

  if (taken) {
    return {
      success: false,
      error: ARTICLE_ERRORS.slugTaken,
      fieldErrors: { slug: ARTICLE_ERRORS.slugTaken },
    };
  }

  return { success: true };
}

async function validateTaxonomy(
  tagIds: string[]
): Promise<ArticleActionResult> {
  const tagsValid = await verifyArticleTags(tagIds);

  if (!tagsValid) {
    return {
      success: false,
      error: ARTICLE_ERRORS.tagInvalid,
      fieldErrors: { tag_ids: ARTICLE_ERRORS.tagInvalid },
    };
  }

  return { success: true };
}

function toArticleInsertRow(input: ArticleDraftInput | ArticlePublishInput) {
  if (!input.cover_media_id) {
    throw new Error("cover_media_id is required by database schema");
  }

  const content = toArticleContentForSave(input.content);
  const body = buildArticleBody(content.blocks);
  const readingTimeMinutes = calculateReadingTimeMinutes(content.blocks);

  return {
    title: input.title,
    slug: input.slug,
    body,
    cover_media_id: input.cover_media_id,
    seo_og_media_id: input.seo_og_media_id,
    reading_time_minutes: readingTimeMinutes,
    content,
    seo: normalizeStoredSeoForSave(input.seo),
    featured: input.featured,
    status: input.status,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };
}

function toArticleUpdateRow(
  input: ArticleDraftInput | ArticlePublishInput,
  existingPublishedAt: string | null
) {
  if (!input.cover_media_id) {
    throw new Error("cover_media_id is required by database schema");
  }

  const content = toArticleContentForSave(input.content);
  const body = buildArticleBody(content.blocks);
  const readingTimeMinutes = calculateReadingTimeMinutes(content.blocks);
  const isPublishing = input.status === "published";
  const publishedAt =
    isPublishing && !existingPublishedAt
      ? new Date().toISOString()
      : existingPublishedAt;

  return {
    title: input.title,
    slug: input.slug,
    body,
    cover_media_id: input.cover_media_id,
    seo_og_media_id: input.seo_og_media_id,
    reading_time_minutes: readingTimeMinutes,
    content,
    seo: normalizeStoredSeoForSave(input.seo),
    featured: input.featured,
    status: input.status,
    published_at: publishedAt,
  };
}

async function syncArticleTags(
  supabase: SupabaseClient,
  articleId: string,
  tagIds: string[]
): Promise<boolean> {
  const { error: deleteError } = await supabase
    .from("article_tags")
    .delete()
    .eq("article_id", articleId);

  if (deleteError) {
    console.error("[articles] syncArticleTags delete failed", deleteError);
    return false;
  }

  if (tagIds.length === 0) {
    return true;
  }

  const rows = tagIds.map((tagId) => ({
    article_id: articleId,
    tag_id: tagId,
  }));

  const { error: insertError } = await supabase.from("article_tags").insert(rows);

  if (insertError) {
    console.error("[articles] syncArticleTags insert failed", insertError);
  }

  return !insertError;
}

export async function createArticleAction(
  input: ArticleDraftInput
): Promise<ArticleActionResult<{ id: string }>> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed =
    input.status === "published"
      ? articlePublishInputSchema.safeParse(input)
      : createArticleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: ARTICLE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const data = parsed.data;

  if (!data.cover_media_id) {
    return {
      success: false,
      error: ARTICLE_ERRORS.coverRequired,
      fieldErrors: { cover_media_id: ARTICLE_ERRORS.coverRequired },
    };
  }

  const contentForSave = toArticleContentForSave(data.content);
  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    collectContentMediaIds(
      contentForSave.blocks,
      contentForSave.gallery.map((item) => item.media_id)
    ),
    data.status === "published"
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const taxonomyValidation = await validateTaxonomy(data.tag_ids);

  if (!taxonomyValidation.success) {
    return taxonomyValidation;
  }

  const slugValidation = await validateSlugAvailability(data.slug);

  if (!slugValidation.success) {
    return slugValidation;
  }

  const { data: inserted, error } = await session.supabase
    .from("articles")
    .insert(toArticleInsertRow(data))
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[articles] createArticleAction insert failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const tagsSynced = await syncArticleTags(
    session.supabase,
    inserted.id,
    data.tag_ids
  );

  if (!tagsSynced) {
    await session.supabase.from("articles").delete().eq("id", inserted.id);

    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(inserted.id);

  return { success: true, data: { id: inserted.id } };
}

export async function updateArticleAction(
  input: ArticleDraftInput & { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = updateArticleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: ARTICLE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const existing = await fetchArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  const data = parsed.data;

  // Validate slug availability if it changed
  if (data.slug !== existing.slug) {
    const slugValidation = await validateSlugAvailability(data.slug, existing.id);
    if (!slugValidation.success) {
      return slugValidation;
    }
  }

  if (!data.cover_media_id) {
    return {
      success: false,
      error: ARTICLE_ERRORS.coverRequired,
      fieldErrors: { cover_media_id: ARTICLE_ERRORS.coverRequired },
    };
  }

  const contentForSave = toArticleContentForSave(data.content);
  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    collectContentMediaIds(
      contentForSave.blocks,
      contentForSave.gallery.map((item) => item.media_id)
    ),
    data.status === "published"
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const taxonomyValidation = await validateTaxonomy(data.tag_ids);

  if (!taxonomyValidation.success) {
    return taxonomyValidation;
  }

  const { error } = await session.supabase
    .from("articles")
    .update(toArticleUpdateRow(data, existing.published_at))
    .eq("id", data.id);

  if (error) {
    console.error("[articles] article update failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const tagsSynced = await syncArticleTags(
    session.supabase,
    data.id,
    data.tag_ids
  );

  if (!tagsSynced) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(data.id);

  return { success: true };
}

export async function publishArticleAction(
  input: ArticlePublishInput & { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = publishArticleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: ARTICLE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const existing = await fetchArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  const data = {
    ...parsed.data,
    slug: existing.slug,
  };
  const contentForSave = toArticleContentForSave(data.content);
  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    collectContentMediaIds(
      contentForSave.blocks,
      contentForSave.gallery.map((item) => item.media_id)
    ),
    true
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const taxonomyValidation = await validateTaxonomy(data.tag_ids);

  if (!taxonomyValidation.success) {
    return taxonomyValidation;
  }

  const { error } = await session.supabase
    .from("articles")
    .update(toArticleUpdateRow(data, existing.published_at))
    .eq("id", data.id);

  if (error) {
    console.error("[articles] article update failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const tagsSynced = await syncArticleTags(
    session.supabase,
    data.id,
    data.tag_ids
  );

  if (!tagsSynced) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(data.id);

  return { success: true };
}

export async function duplicateArticleAction(
  input: { id: string }
): Promise<ArticleActionResult<{ id: string }>> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = duplicateArticleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const source = await fetchArticleById(parsed.data.id);

  if (!source) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  const newTitle = buildDuplicateTitle(source.title);
  const slugBase = buildDuplicateSlugBase(source.slug);
  const newSlug = await buildUniqueArticleSlug(slugBase, (slug) =>
    isArticleSlugTaken(slug)
  );

  const { data: inserted, error } = await session.supabase
    .from("articles")
    .insert({
      title: newTitle,
      slug: newSlug,
      body: source.body,
      cover_media_id: source.cover_media_id,
      seo_og_media_id: source.seo_og_media_id,
      reading_time_minutes: source.reading_time_minutes,
      content: source.content,
      seo: source.seo,
      featured: false,
      status: "draft",
      published_at: null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[articles] duplicateArticleAction insert failed", error);
    return { success: false, error: ARTICLE_ERRORS.duplicateFailed };
  }

  const tagsSynced = await syncArticleTags(
    session.supabase,
    inserted.id,
    source.tags.map((tag) => tag.id)
  );

  if (!tagsSynced) {
    await session.supabase.from("articles").delete().eq("id", inserted.id);

    return { success: false, error: ARTICLE_ERRORS.duplicateFailed };
  }

  revalidateArticlePaths(inserted.id);

  return { success: true, data: { id: inserted.id } };
}

export async function quickPublishArticleAction(
  input: { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = quickPublishArticleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const existing = await fetchArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  if (existing.status !== "draft") {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const publishedAt =
    existing.published_at ?? new Date().toISOString();

  const { error } = await session.supabase
    .from("articles")
    .update({
      status: "published",
      published_at: publishedAt,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[articles] quickPublishArticleAction update failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(parsed.data.id);

  return { success: true };
}

export async function unpublishArticleAction(
  input: { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = unpublishArticleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const existing = await fetchArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  if (existing.status !== "published") {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const { error } = await session.supabase
    .from("articles")
    .update({ status: "draft" })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[articles] unpublishArticleAction update failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(parsed.data.id);

  return { success: true };
}

export async function archiveArticleAction(
  input: { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = archiveArticleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const { error } = await session.supabase
    .from("articles")
    .update({ status: "archived" })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[articles] archiveArticleAction update failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(parsed.data.id);

  return { success: true };
}

export async function restoreArticleToDraftAction(
  input: { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = archiveArticleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const existing = await fetchArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  const { error } = await session.supabase
    .from("articles")
    .update({ status: "draft" })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[articles] restoreArticleToDraftAction update failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(parsed.data.id);

  return { success: true };
}

export async function restoreAndPublishArticleAction(
  input: { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = archiveArticleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const existing = await fetchArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  const publishedAt =
    existing.published_at ?? new Date().toISOString();

  const { error } = await session.supabase
    .from("articles")
    .update({
      status: "published",
      published_at: publishedAt,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error(
      "[articles] restoreAndPublishArticleAction update failed",
      error
    );
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths(parsed.data.id);

  return { success: true };
}

export async function permanentlyDeleteArticleAction(
  input: { id: string }
): Promise<ArticleActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: ARTICLE_ERRORS.unauthorized };
  }

  const parsed = permanentlyDeleteArticleSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const existing = await fetchArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: ARTICLE_ERRORS.notFound };
  }

  const { error: tagsError } = await session.supabase
    .from("article_tags")
    .delete()
    .eq("article_id", parsed.data.id);

  if (tagsError) {
    console.error(
      "[articles] permanentlyDeleteArticleAction tag delete failed",
      tagsError
    );
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  const { error } = await session.supabase
    .from("articles")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[articles] permanentlyDeleteArticleAction delete failed", error);
    return { success: false, error: ARTICLE_ERRORS.generic };
  }

  revalidateArticlePaths();

  return { success: true };
}
