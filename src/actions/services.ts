"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { normalizeStoredSeoForSave } from "@/lib/seo/resolve";
import {
  fetchServiceById,
  isServiceSlugTaken,
  verifyMediaExists,
} from "@/lib/services/queries";
import {
  buildDuplicateSlugBase,
  buildDuplicateTitle,
  buildUniqueServiceSlug,
  createDraftServiceSlugBase,
} from "@/lib/services/slug";
import type {
  ServiceActionResult,
} from "@/lib/services/types";
import {
  archiveServiceSchema,
  createServiceSchema,
  duplicateServiceSchema,
  mapZodErrors,
  permanentlyDeleteServiceSchema,
  publishServiceSchema,
  quickPublishServiceSchema,
  restoreServiceSchema,
  servicePublishInputSchema,
  serviceRecordToPublishInput,
  unpublishServiceSchema,
  updateServiceSchema,
  type ServiceDraftInput,
  type ServicePublishInput,
} from "@/lib/validations/service";
import { SERVICE_ERRORS } from "@/lib/services/errors";

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

function revalidateServicePaths(serviceId?: string) {
  revalidatePath("/admin/services");

  // Public surfaces that list services and link to their (slug-based) detail
  // pages. Without this a publish / unpublish / feature change — or a rename
  // done before slugs were frozen — leaves the statically rendered listing
  // pointing at a stale URL that 404s.
  revalidatePath("/services");
  revalidatePath("/services", "layout");
  revalidatePath("/");

  if (serviceId) {
    revalidatePath(`/admin/services/${serviceId}`);
    revalidatePath(`/admin/services/${serviceId}/preview`);
  }
}

async function validateMediaIds(
  coverMediaId: string | null,
  ogMediaId: string | null
): Promise<ServiceActionResult> {
  if (coverMediaId) {
    const coverExists = await verifyMediaExists(coverMediaId);

    if (!coverExists) {
      return {
        success: false,
        error: SERVICE_ERRORS.mediaNotFound,
        fieldErrors: { cover_media_id: SERVICE_ERRORS.mediaNotFound },
      };
    }
  }

  if (ogMediaId) {
    const ogExists = await verifyMediaExists(ogMediaId);

    if (!ogExists) {
      return {
        success: false,
        error: SERVICE_ERRORS.mediaNotFound,
        fieldErrors: { seo_og_media_id: SERVICE_ERRORS.mediaNotFound },
      };
    }
  }

  return { success: true };
}

async function validateSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<ServiceActionResult> {
  const taken = await isServiceSlugTaken(slug, excludeId);

  if (taken) {
    return {
      success: false,
      error: SERVICE_ERRORS.slugTaken,
      fieldErrors: { slug: SERVICE_ERRORS.slugTaken },
    };
  }

  return { success: true };
}

async function resolveServiceSlugForSave(
  slug: string,
  options?: {
    excludeId?: string;
    existingSlug?: string | null;
  }
): Promise<ServiceActionResult<string>> {
  const trimmed = slug.trim();

  if (trimmed) {
    const availability = await validateSlugAvailability(
      trimmed,
      options?.excludeId
    );

    if (!availability.success) {
      return availability;
    }

    return { success: true, data: trimmed };
  }

  const existingSlug = options?.existingSlug?.trim();

  if (existingSlug) {
    return { success: true, data: existingSlug };
  }

  const uniqueSlug = await buildUniqueServiceSlug(
    createDraftServiceSlugBase(),
    (candidate) => isServiceSlugTaken(candidate, options?.excludeId)
  );

  return { success: true, data: uniqueSlug };
}

function toServiceInsertRow(
  input: ServiceDraftInput | ServicePublishInput
) {
  return {
    title: input.title,
    card_title: input.card_title.trim() || null,
    slug: input.slug,
    short_description: input.short_description,
    full_introduction: input.full_introduction,
    cover_media_id: input.cover_media_id,
    seo_og_media_id: input.seo_og_media_id,
    content: input.content,
    seo: normalizeStoredSeoForSave(input.seo),
    featured: input.featured,
    status: input.status,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };
}

function toServiceUpdateRow(
  input: ServiceDraftInput | ServicePublishInput,
  existingPublishedAt: string | null
) {
  const isPublishing = input.status === "published";
  const publishedAt =
    isPublishing && !existingPublishedAt
      ? new Date().toISOString()
      : existingPublishedAt;

  return {
    title: input.title,
    card_title: input.card_title.trim() || null,
    slug: input.slug,
    short_description: input.short_description,
    full_introduction: input.full_introduction,
    cover_media_id: input.cover_media_id,
    seo_og_media_id: input.seo_og_media_id,
    content: input.content,
    seo: normalizeStoredSeoForSave(input.seo),
    featured: input.featured,
    status: input.status,
    published_at: publishedAt,
  };
}

export async function createServiceAction(
  input: ServiceDraftInput
): Promise<ServiceActionResult<{ id: string }>> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed =
    input.status === "published"
      ? servicePublishInputSchema.safeParse(input)
      : createServiceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: SERVICE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const data = parsed.data;

  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const slugResolution = await resolveServiceSlugForSave(data.slug);

  if (!slugResolution.success) {
    return {
      success: false,
      error: slugResolution.error,
      fieldErrors: slugResolution.fieldErrors,
    };
  }

  if (!slugResolution.data) {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const rowInput = {
    ...data,
    slug: slugResolution.data,
  } as ServiceDraftInput | ServicePublishInput;

  const { data: inserted, error } = await session.supabase
    .from("services")
    .insert(toServiceInsertRow(rowInput))
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[services] createServiceAction insert failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths(inserted.id);

  return { success: true, data: { id: inserted.id } };
}

export async function updateServiceAction(
  input: ServiceDraftInput & { id: string }
): Promise<ServiceActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed =
    input.status === "published"
      ? publishServiceSchema.safeParse({ ...input, status: "published" })
      : updateServiceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        input.status === "published"
          ? SERVICE_ERRORS.publishRequirements
          : SERVICE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const existing = await fetchServiceById(parsed.data.id);

  if (!existing) {
    return { success: false, error: SERVICE_ERRORS.notFound };
  }

  // The slug is the public URL and is frozen after the first save. Never let an
  // edit change it — the form may post a freshly slugified value when the title
  // changes, and persisting it would 404 every existing link to the page.
  const data = { ...parsed.data, slug: existing.slug };

  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const rowInput = data;

  const { error } = await session.supabase
    .from("services")
    .update(toServiceUpdateRow(rowInput, existing.published_at))
    .eq("id", data.id);

  if (error) {
    console.error("[services] updateServiceAction update failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths(data.id);

  return { success: true };
}

export async function publishServiceAction(
  input: ServicePublishInput & { id: string }
): Promise<ServiceActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed = publishServiceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: SERVICE_ERRORS.generic,
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const existing = await fetchServiceById(parsed.data.id);

  if (!existing) {
    return { success: false, error: SERVICE_ERRORS.notFound };
  }

  const data = {
    ...parsed.data,
    slug: existing.slug,
  };
  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const { error } = await session.supabase
    .from("services")
    .update(toServiceUpdateRow(data, existing.published_at))
    .eq("id", data.id);

  if (error) {
    console.error("[services] publishServiceAction update failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths(data.id);

  return { success: true };
}

export async function duplicateServiceAction(
  input: { id: string }
): Promise<ServiceActionResult<{ id: string }>> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed = duplicateServiceSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const source = await fetchServiceById(parsed.data.id);

  if (!source) {
    return { success: false, error: SERVICE_ERRORS.notFound };
  }

  const newTitle = buildDuplicateTitle(source.title);
  const slugBase = buildDuplicateSlugBase(source.slug);
  const newSlug = await buildUniqueServiceSlug(slugBase, (slug) =>
    isServiceSlugTaken(slug)
  );

  const { data: inserted, error } = await session.supabase
    .from("services")
    .insert({
      title: newTitle,
      card_title: source.card_title ?? null,
      slug: newSlug,
      short_description: source.short_description,
      full_introduction: source.full_introduction,
      cover_media_id: source.cover_media_id,
      seo_og_media_id: source.seo_og_media_id,
      content: source.content,
      seo: source.seo,
      featured: false,
      status: "draft",
      published_at: null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[services] duplicateServiceAction insert failed", error);
    return { success: false, error: SERVICE_ERRORS.duplicateFailed };
  }

  revalidateServicePaths(inserted.id);

  return { success: true, data: { id: inserted.id } };
}

export async function quickPublishServiceAction(
  input: { id: string }
): Promise<ServiceActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed = quickPublishServiceSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const existing = await fetchServiceById(parsed.data.id);

  if (!existing) {
    return { success: false, error: SERVICE_ERRORS.notFound };
  }

  if (existing.status !== "draft") {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const publishCheck = servicePublishInputSchema.safeParse(
    serviceRecordToPublishInput(existing)
  );

  if (!publishCheck.success) {
    return {
      success: false,
      error: SERVICE_ERRORS.publishRequirements,
      fieldErrors: mapZodErrors(publishCheck.error),
    };
  }

  const publishedAt =
    existing.published_at ?? new Date().toISOString();

  const { error } = await session.supabase
    .from("services")
    .update({
      status: "published",
      published_at: publishedAt,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[services] quickPublishServiceAction update failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths(parsed.data.id);

  return { success: true };
}

export async function unpublishServiceAction(
  input: { id: string }
): Promise<ServiceActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed = unpublishServiceSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const existing = await fetchServiceById(parsed.data.id);

  if (!existing) {
    return { success: false, error: SERVICE_ERRORS.notFound };
  }

  if (existing.status !== "published") {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const { error } = await session.supabase
    .from("services")
    .update({ status: "draft" })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[services] unpublishServiceAction update failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths(parsed.data.id);

  return { success: true };
}

export async function archiveServiceAction(
  input: { id: string }
): Promise<ServiceActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed = archiveServiceSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const { error } = await session.supabase
    .from("services")
    .update({ status: "archived" })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[services] archiveServiceAction update failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths(parsed.data.id);

  return { success: true };
}

export async function restoreServiceAction(
  input: { id: string; publish?: boolean }
): Promise<ServiceActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed = restoreServiceSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const existing = await fetchServiceById(parsed.data.id);

  if (!existing) {
    return { success: false, error: SERVICE_ERRORS.notFound };
  }

  const nextStatus = parsed.data.publish ? "published" : "draft";

  if (nextStatus === "published") {
    const publishCheck = servicePublishInputSchema.safeParse(
      serviceRecordToPublishInput(existing)
    );

    if (!publishCheck.success) {
      return {
        success: false,
        error: SERVICE_ERRORS.publishRequirements,
        fieldErrors: mapZodErrors(publishCheck.error),
      };
    }
  }

  const publishedAt =
    nextStatus === "published" && !existing.published_at
      ? new Date().toISOString()
      : existing.published_at;

  const { error } = await session.supabase
    .from("services")
    .update({
      status: nextStatus,
      published_at: publishedAt,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[services] restoreServiceAction update failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths(parsed.data.id);

  return { success: true };
}

export async function permanentlyDeleteServiceAction(
  input: { id: string }
): Promise<ServiceActionResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: SERVICE_ERRORS.unauthorized };
  }

  const parsed = permanentlyDeleteServiceSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  const existing = await fetchServiceById(parsed.data.id);

  if (!existing) {
    return { success: false, error: SERVICE_ERRORS.notFound };
  }

  const { error } = await session.supabase
    .from("services")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[services] permanentlyDeleteServiceAction delete failed", error);
    return { success: false, error: SERVICE_ERRORS.generic };
  }

  revalidateServicePaths();

  return { success: true };
}

export async function checkServiceSlugAction(
  slug: string,
  excludeId?: string
): Promise<{ available: boolean }> {
  const session = await getAdminSupabase();

  if (!session) {
    return { available: false };
  }

  const taken = await isServiceSlugTaken(slug, excludeId);

  return { available: !taken };
}
