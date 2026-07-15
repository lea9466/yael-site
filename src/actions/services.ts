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
  restoreServiceSchema,
  servicePublishInputSchema,
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

  if (serviceId) {
    revalidatePath(`/admin/services/${serviceId}`);
    revalidatePath(`/admin/services/${serviceId}/preview`);
  }
}

async function validateMediaIds(
  coverMediaId: string | null,
  ogMediaId: string | null,
  requireCover: boolean
): Promise<ServiceActionResult> {
  if (requireCover && !coverMediaId) {
    return {
      success: false,
      error: SERVICE_ERRORS.coverRequiredPublish,
      fieldErrors: { cover_media_id: SERVICE_ERRORS.coverRequiredPublish },
    };
  }

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

function toServiceInsertRow(
  input: ServiceDraftInput | ServicePublishInput
) {
  if (!input.cover_media_id) {
    throw new Error("cover_media_id is required by database schema");
  }

  return {
    title: input.title,
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
  const requireCover = data.status === "published";

  if (!data.cover_media_id) {
    return {
      success: false,
      error: SERVICE_ERRORS.coverRequired,
      fieldErrors: { cover_media_id: SERVICE_ERRORS.coverRequired },
    };
  }

  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    requireCover
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const slugValidation = await validateSlugAvailability(data.slug);

  if (!slugValidation.success) {
    return slugValidation;
  }

  const { data: inserted, error } = await session.supabase
    .from("services")
    .insert(toServiceInsertRow(parsed.data as ServiceDraftInput | ServicePublishInput))
    .select("id")
    .single();

  if (error || !inserted) {
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

  const parsed = updateServiceSchema.safeParse(input);

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

  const data = parsed.data;

  if (!data.cover_media_id) {
    return {
      success: false,
      error: SERVICE_ERRORS.coverRequired,
      fieldErrors: { cover_media_id: SERVICE_ERRORS.coverRequired },
    };
  }

  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    data.status === "published"
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const slugValidation = await validateSlugAvailability(data.slug, data.id);

  if (!slugValidation.success) {
    return slugValidation;
  }

  const { error } = await session.supabase
    .from("services")
    .update(toServiceUpdateRow(data, existing.published_at))
    .eq("id", data.id);

  if (error) {
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

  const data = parsed.data;
  const mediaValidation = await validateMediaIds(
    data.cover_media_id,
    data.seo_og_media_id,
    true
  );

  if (!mediaValidation.success) {
    return mediaValidation;
  }

  const slugValidation = await validateSlugAvailability(data.slug, data.id);

  if (!slugValidation.success) {
    return slugValidation;
  }

  const { error } = await session.supabase
    .from("services")
    .update(toServiceUpdateRow(data, existing.published_at))
    .eq("id", data.id);

  if (error) {
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
    return { success: false, error: SERVICE_ERRORS.duplicateFailed };
  }

  revalidateServicePaths(inserted.id);

  return { success: true, data: { id: inserted.id } };
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

  if (existing.status !== "archived") {
    return { success: false, error: SERVICE_ERRORS.archiveOnlyDelete };
  }

  const { error } = await session.supabase
    .from("services")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
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
