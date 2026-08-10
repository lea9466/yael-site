"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { buildRecipeContentForSave } from "@/lib/recipes/content";
import { RECIPE_ERRORS } from "@/lib/recipes/errors";
import {
  fetchRecipeById,
  isRecipeSlugTaken,
  verifyMediaExists,
} from "@/lib/recipes/queries";
import {
  buildDuplicateSlugBase,
  buildDuplicateTitle,
  buildUniqueRecipeSlug,
} from "@/lib/recipes/slug";
import type { RecipeActionResult } from "@/lib/recipes/types";
import {
  verifyRecipeCategory,
  verifyRecipeTags,
} from "@/lib/taxonomy/queries";
import { normalizeStoredSeoForSave } from "@/lib/seo/resolve";
import {
  archiveRecipeSchema,
  createRecipeSchema,
  duplicateRecipeSchema,
  mapZodErrors,
  permanentlyDeleteRecipeSchema,
  publishRecipeSchema,
  quickPublishRecipeSchema,
  recipePublishInputSchema,
  unpublishRecipeSchema,
  updateRecipeSchema,
  type RecipeDraftInput,
  type RecipePublishInput,
} from "@/lib/validations/recipe";

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

function revalidateRecipePaths(
  recipeId?: string,
  slug?: string,
  categorySlug?: string | null
) {
  revalidatePath("/admin/recipes");
  revalidatePath("/recipes", "layout");

  if (recipeId) {
    revalidatePath(`/admin/recipes/${recipeId}`);
    revalidatePath(`/admin/recipes/${recipeId}/preview`);
  }

  if (slug) {
    revalidatePath(`/recipes/${slug}`);

    if (categorySlug) {
      revalidatePath(`/recipes/${categorySlug}`);
      revalidatePath(`/recipes/${categorySlug}/${slug}`);
    }
  }
}

async function validateMediaIds(
  coverMediaId: string | null,
  ogMediaId: string | null,
  galleryMediaIds: string[],
  requireCover: boolean
): Promise<RecipeActionResult> {
  if (requireCover && !coverMediaId) {
    return {
      success: false,
      error: RECIPE_ERRORS.coverRequiredPublish,
      fieldErrors: { cover_media_id: RECIPE_ERRORS.coverRequiredPublish },
    };
  }

  if (coverMediaId) {
    const coverExists = await verifyMediaExists(coverMediaId);

    if (!coverExists) {
      return {
        success: false,
        error: RECIPE_ERRORS.mediaNotFound,
        fieldErrors: { cover_media_id: RECIPE_ERRORS.mediaNotFound },
      };
    }
  }

  if (ogMediaId) {
    const ogExists = await verifyMediaExists(ogMediaId);

    if (!ogExists) {
      return {
        success: false,
        error: RECIPE_ERRORS.mediaNotFound,
        fieldErrors: { seo_og_media_id: RECIPE_ERRORS.mediaNotFound },
      };
    }
  }

  for (const mediaId of galleryMediaIds) {
    const exists = await verifyMediaExists(mediaId);

    if (!exists) {
      return {
        success: false,
        error: RECIPE_ERRORS.mediaNotFound,
        fieldErrors: { "content.gallery": RECIPE_ERRORS.mediaNotFound },
      };
    }
  }

  return { success: true };
}

async function validateSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<RecipeActionResult> {
  const taken = await isRecipeSlugTaken(slug, excludeId);

  if (taken) {
    return {
      success: false,
      error: RECIPE_ERRORS.slugTaken,
      fieldErrors: { slug: RECIPE_ERRORS.slugTaken },
    };
  }

  return { success: true };
}

async function validateTaxonomy(
  categoryId: string,
  tagIds: string[]
): Promise<RecipeActionResult> {
  const categoryValid = await verifyRecipeCategory(categoryId);

  if (!categoryValid) {
    return {
      success: false,
      error: RECIPE_ERRORS.categoryInvalid,
      fieldErrors: { category_id: RECIPE_ERRORS.categoryInvalid },
    };
  }

  const tagsValid = await verifyRecipeTags(tagIds);

  if (!tagsValid) {
    return {
      success: false,
      error: RECIPE_ERRORS.tagInvalid,
      fieldErrors: { tag_ids: RECIPE_ERRORS.tagInvalid },
    };
  }

  return { success: true };
}

function toRecipeContentForSave(
  content: RecipeDraftInput["content"]
): RecipeDraftInput["content"] {
  const saved = buildRecipeContentForSave({
    recipe_sections: content.recipe_sections ?? [],
    yael_tip: content.yael_tip,
    gallery: content.gallery,
  });

  return {
    recipe_sections: saved.recipe_sections,
    yael_tip: saved.yael_tip,
    gallery: saved.gallery,
  };
}

function toRecipeInsertRow(input: RecipeDraftInput | RecipePublishInput) {
  if (!input.cover_media_id) {
    throw new Error("cover_media_id is required by database schema");
  }

  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    cover_media_id: input.cover_media_id,
    seo_og_media_id: input.seo_og_media_id,
    category_id: input.category_id,
    prep_duration: input.prep_duration,
    servings: input.servings,
    content: toRecipeContentForSave(input.content),
    seo: normalizeStoredSeoForSave(input.seo),
    featured: input.featured,
    status: input.status,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };
}

function toRecipeUpdateRow(
  input: RecipeDraftInput | RecipePublishInput,
  existingPublishedAt: string | null
) {
  if (!input.cover_media_id) {
    throw new Error("cover_media_id is required by database schema");
  }

  const isPublishing = input.status === "published";
  const publishedAt =
    isPublishing && !existingPublishedAt
      ? new Date().toISOString()
      : existingPublishedAt;

  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    cover_media_id: input.cover_media_id,
    seo_og_media_id: input.seo_og_media_id,
    category_id: input.category_id,
    prep_duration: input.prep_duration,
    servings: input.servings,
    content: toRecipeContentForSave(input.content),
    seo: normalizeStoredSeoForSave(input.seo),
    featured: input.featured,
    status: input.status,
    published_at: publishedAt,
  };
}

async function syncRecipeTags(
  supabase: SupabaseClient,
  recipeId: string,
  tagIds: string[]
): Promise<boolean> {
  const { error: deleteError } = await supabase
    .from("recipe_tags")
    .delete()
    .eq("recipe_id", recipeId);

  if (deleteError) {
    return false;
  }

  if (tagIds.length === 0) {
    return true;
  }

  const rows = tagIds.map((tagId) => ({
    recipe_id: recipeId,
    tag_id: tagId,
  }));

  const { error: insertError } = await supabase.from("recipe_tags").insert(rows);

  return !insertError;
}

export async function createRecipeAction(
  input: RecipeDraftInput
): Promise<RecipeActionResult<{ id: string }>> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed =
    input.status === "published"
      ? recipePublishInputSchema.safeParse(input)
      : createRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: RECIPE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const data = parsed.data;

  if (!data.cover_media_id) {
    return {
      success: false,
      error: RECIPE_ERRORS.coverRequired,
      fieldErrors: { cover_media_id: RECIPE_ERRORS.coverRequired },
    };
  }

  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    data.content.gallery.map((item) => item.media_id),
    data.status === "published"
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const taxonomyValidation = await validateTaxonomy(
    data.category_id,
    data.tag_ids
  );

  if (!taxonomyValidation.success) {
    return taxonomyValidation;
  }

  const slugValidation = await validateSlugAvailability(data.slug);

  if (!slugValidation.success) {
    return slugValidation;
  }

  const { data: inserted, error } = await session.supabase
    .from("recipes")
    .insert(toRecipeInsertRow(data))
    .select("id")
    .single();

  if (error || !inserted) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const tagsSynced = await syncRecipeTags(
    session.supabase,
    inserted.id,
    data.tag_ids
  );

  if (!tagsSynced) {
    await session.supabase.from("recipes").delete().eq("id", inserted.id);

    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(inserted.id, data.slug);

  return { success: true, data: { id: inserted.id } };
}

export async function updateRecipeAction(
  input: RecipeDraftInput & { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = updateRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: RECIPE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  const data = {
    ...parsed.data,
    slug: existing.slug,
  };

  if (!data.cover_media_id) {
    return {
      success: false,
      error: RECIPE_ERRORS.coverRequired,
      fieldErrors: { cover_media_id: RECIPE_ERRORS.coverRequired },
    };
  }

  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    data.content.gallery.map((item) => item.media_id),
    data.status === "published"
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const taxonomyValidation = await validateTaxonomy(
    data.category_id,
    data.tag_ids
  );

  if (!taxonomyValidation.success) {
    return taxonomyValidation;
  }

  const { error } = await session.supabase
    .from("recipes")
    .update(toRecipeUpdateRow(data, existing.published_at))
    .eq("id", data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const tagsSynced = await syncRecipeTags(
    session.supabase,
    data.id,
    data.tag_ids
  );

  if (!tagsSynced) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(data.id, data.slug, existing.category?.slug);

  return { success: true };
}

export async function publishRecipeAction(
  input: RecipePublishInput & { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = publishRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: RECIPE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  const data = {
    ...parsed.data,
    slug: existing.slug,
  };
  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    data.content.gallery.map((item) => item.media_id),
    true
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const taxonomyValidation = await validateTaxonomy(
    data.category_id,
    data.tag_ids
  );

  if (!taxonomyValidation.success) {
    return taxonomyValidation;
  }

  const { error } = await session.supabase
    .from("recipes")
    .update(toRecipeUpdateRow(data, existing.published_at))
    .eq("id", data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const tagsSynced = await syncRecipeTags(
    session.supabase,
    data.id,
    data.tag_ids
  );

  if (!tagsSynced) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(data.id, data.slug, existing.category?.slug);

  return { success: true };
}

export async function duplicateRecipeAction(
  input: { id: string }
): Promise<RecipeActionResult<{ id: string }>> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = duplicateRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const source = await fetchRecipeById(parsed.data.id);

  if (!source) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  const newTitle = buildDuplicateTitle(source.title);
  const slugBase = buildDuplicateSlugBase(source.slug);
  const newSlug = await buildUniqueRecipeSlug(slugBase, (slug) =>
    isRecipeSlugTaken(slug)
  );

  const { data: inserted, error } = await session.supabase
    .from("recipes")
    .insert({
      title: newTitle,
      slug: newSlug,
      description: source.description,
      cover_media_id: source.cover_media_id,
      seo_og_media_id: source.seo_og_media_id,
      category_id: source.category_id,
      prep_duration: source.prep_duration,
      servings: source.servings,
      content: source.content,
      seo: source.seo,
      featured: false,
      status: "draft",
      published_at: null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { success: false, error: RECIPE_ERRORS.duplicateFailed };
  }

  const tagsSynced = await syncRecipeTags(
    session.supabase,
    inserted.id,
    source.tags.map((tag) => tag.id)
  );

  if (!tagsSynced) {
    await session.supabase.from("recipes").delete().eq("id", inserted.id);

    return { success: false, error: RECIPE_ERRORS.duplicateFailed };
  }

  revalidateRecipePaths(inserted.id);

  return { success: true, data: { id: inserted.id } };
}

export async function quickPublishRecipeAction(
  input: { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = quickPublishRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  if (existing.status !== "draft") {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const publishedAt =
    existing.published_at ?? new Date().toISOString();

  const { error } = await session.supabase
    .from("recipes")
    .update({
      status: "published",
      published_at: publishedAt,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(
    parsed.data.id,
    existing.slug,
    existing.category?.slug
  );

  return { success: true };
}

export async function unpublishRecipeAction(
  input: { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = unpublishRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  if (existing.status !== "published") {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const { error } = await session.supabase
    .from("recipes")
    .update({ status: "draft" })
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(
    parsed.data.id,
    existing.slug,
    existing.category?.slug
  );

  return { success: true };
}

export async function archiveRecipeAction(
  input: { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = archiveRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  const { error } = await session.supabase
    .from("recipes")
    .update({ status: "archived" })
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(
    parsed.data.id,
    existing.slug,
    existing.category?.slug
  );

  return { success: true };
}

export async function restoreRecipeToDraftAction(
  input: { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = archiveRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  const { error } = await session.supabase
    .from("recipes")
    .update({ status: "draft" })
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(
    parsed.data.id,
    existing.slug,
    existing.category?.slug
  );

  return { success: true };
}

export async function restoreAndPublishRecipeAction(
  input: { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = archiveRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  const publishedAt =
    existing.published_at ?? new Date().toISOString();

  const { error } = await session.supabase
    .from("recipes")
    .update({
      status: "published",
      published_at: publishedAt,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(
    parsed.data.id,
    existing.slug,
    existing.category?.slug
  );

  return { success: true };
}

export async function permanentlyDeleteRecipeAction(
  input: { id: string }
): Promise<RecipeActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: RECIPE_ERRORS.unauthorized };
  }

  const parsed = permanentlyDeleteRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const existing = await fetchRecipeById(parsed.data.id);

  if (!existing) {
    return { success: false, error: RECIPE_ERRORS.notFound };
  }

  const { error: tagsError } = await session.supabase
    .from("recipe_tags")
    .delete()
    .eq("recipe_id", parsed.data.id);

  if (tagsError) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  const { error } = await session.supabase
    .from("recipes")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: RECIPE_ERRORS.generic };
  }

  revalidateRecipePaths(undefined, existing.slug, existing.category?.slug);

  return { success: true };
}
