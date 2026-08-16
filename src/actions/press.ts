"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { PRESS_ERRORS } from "@/lib/press/errors";
import {
  fetchPressArticleById,
  isPressSlugTaken,
  verifyMediaExists,
  verifyMediaMime,
} from "@/lib/press/queries";
import type {
  PressArticleActionResult,
  PressArticleFormValues,
} from "@/lib/press/types";
import { normalizePressFormForSave } from "@/lib/press/form";
import {
  createPressArticleSchema,
  deletePressArticleSchema,
  mapZodErrors,
  updatePressArticleSchema,
  type PressArticleInput,
} from "@/lib/validations/press-article";

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

function revalidatePressPaths(articleId?: string, slug?: string) {
  revalidatePath("/admin/press");
  revalidatePath("/press");
  revalidatePath("/press", "layout");
  revalidatePath("/");

  if (articleId) {
    revalidatePath(`/admin/press/${articleId}`);
  }

  if (slug) {
    revalidatePath(`/press/${slug}`);
  }
}

function toDatabasePayload(input: PressArticleInput) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt.length > 0 ? input.excerpt : null,
    publication_name: input.publication_name,
    published_at: input.published_at,
    pdf_media_id: input.pdf_media_id,
    display_order: input.display_order,
    status: input.status,
    seo_title: input.seo_title.length > 0 ? input.seo_title : null,
    seo_description:
      input.seo_description.length > 0 ? input.seo_description : null,
  };
}

async function validateMedia(
  pdfMediaId: string | null,
  requirePdf: boolean
): Promise<PressArticleActionResult | null> {
  if (requirePdf && !pdfMediaId) {
    return {
      success: false,
      error: PRESS_ERRORS.pdfRequiredPublish,
      fieldErrors: { pdf_media_id: PRESS_ERRORS.pdfRequiredPublish },
    };
  }

  if (pdfMediaId) {
    const exists = await verifyMediaExists(pdfMediaId);

    if (!exists) {
      return {
        success: false,
        error: PRESS_ERRORS.mediaNotFound,
        fieldErrors: { pdf_media_id: PRESS_ERRORS.mediaNotFound },
      };
    }

    const isPdf = await verifyMediaMime(pdfMediaId, "pdf");

    if (!isPdf) {
      return {
        success: false,
        error: PRESS_ERRORS.pdfMustBePdf,
        fieldErrors: { pdf_media_id: PRESS_ERRORS.pdfMustBePdf },
      };
    }
  }

  return null;
}

async function validateSlug(
  slug: string,
  excludeId?: string
): Promise<PressArticleActionResult | null> {
  if (!slug) {
    return null;
  }

  const taken = await isPressSlugTaken(slug, excludeId);

  if (taken) {
    return {
      success: false,
      error: PRESS_ERRORS.slugTaken,
      fieldErrors: { slug: PRESS_ERRORS.slugTaken },
    };
  }

  return null;
}

function parseFormValues(
  values: PressArticleFormValues
):
  | { success: true; data: PressArticleInput }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    } {
  const normalized = normalizePressFormForSave(values);
  const parsed = createPressArticleSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  return { success: true, data: parsed.data };
}

export async function createPressArticleAction(
  values: PressArticleFormValues
): Promise<PressArticleActionResult> {
  const parsed = parseFormValues(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error,
      fieldErrors: parsed.fieldErrors,
    };
  }

  const input = parsed.data;
  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: PRESS_ERRORS.unauthorized };
  }

  const mediaError = await validateMedia(
    input.pdf_media_id,
    input.status === "published"
  );

  if (mediaError) {
    return mediaError;
  }

  const slugError = await validateSlug(input.slug);

  if (slugError) {
    return slugError;
  }

  const { data, error } = await adminContext.supabase
    .from("press_articles")
    .insert(toDatabasePayload(input))
    .select("id, slug")
    .single();

  if (error || !data) {
    console.error("[press] createPressArticleAction insert failed", error);
    return { success: false, error: PRESS_ERRORS.generic };
  }

  revalidatePressPaths(data.id, data.slug);

  return { success: true, data: { id: data.id } };
}

export async function updatePressArticleAction(
  values: PressArticleFormValues & { id: string }
): Promise<PressArticleActionResult> {
  const idParsed = updatePressArticleSchema.safeParse({ id: values.id });

  if (!idParsed.success) {
    return { success: false, error: PRESS_ERRORS.generic };
  }

  const normalized = normalizePressFormForSave(values);
  const parsed = createPressArticleSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: PRESS_ERRORS.unauthorized };
  }

  const existing = await fetchPressArticleById(idParsed.data.id);

  if (!existing) {
    return { success: false, error: PRESS_ERRORS.notFound };
  }

  const mediaError = await validateMedia(
    parsed.data.pdf_media_id,
    parsed.data.status === "published"
  );

  if (mediaError) {
    return mediaError;
  }

  const lockedInput = {
    ...parsed.data,
    slug: existing.slug,
  };

  const { error } = await adminContext.supabase
    .from("press_articles")
    .update(toDatabasePayload(lockedInput))
    .eq("id", idParsed.data.id);

  if (error) {
    console.error("[press] updatePressArticleAction update failed", error);
    return { success: false, error: PRESS_ERRORS.generic };
  }

  revalidatePressPaths(idParsed.data.id, existing.slug);

  return { success: true, data: { id: idParsed.data.id } };
}

export async function deletePressArticleAction(
  id: string
): Promise<PressArticleActionResult> {
  const parsed = deletePressArticleSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: PRESS_ERRORS.generic };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: PRESS_ERRORS.unauthorized };
  }

  const existing = await fetchPressArticleById(parsed.data.id);

  if (!existing) {
    return { success: false, error: PRESS_ERRORS.notFound };
  }

  const { error } = await adminContext.supabase
    .from("press_articles")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[press] deletePressArticleAction delete failed", error);
    return { success: false, error: PRESS_ERRORS.generic };
  }

  revalidatePressPaths(parsed.data.id, existing.slug);

  return { success: true };
}
