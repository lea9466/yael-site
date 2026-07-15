"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { TAG_ERRORS } from "@/lib/tags/errors";
import {
  fetchTagById,
  getTagUsageBreakdown,
  isTagNameTaken,
  isTagSlugTaken,
} from "@/lib/tags/queries";
import type { TagActionResult, TagUsageBreakdown } from "@/lib/tags/types";
import {
  createTagSchema,
  deleteTagSchema,
  mapZodErrors,
  updateTagSchema,
  type TagInput,
} from "@/lib/validations/tag";

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

function revalidateTagPaths(tagId?: string) {
  revalidatePath("/admin/tags");
  revalidatePath("/admin/recipes", "layout");
  revalidatePath("/admin/articles", "layout");

  if (tagId) {
    revalidatePath(`/admin/tags/${tagId}`);
  }
}

function buildInUseMessage(breakdown: TagUsageBreakdown): string {
  const parts: string[] = [];

  if (breakdown.recipeCount > 0) {
    parts.push(`${breakdown.recipeCount} מתכונים`);
  }

  if (breakdown.articleCount > 0) {
    parts.push(`${breakdown.articleCount} פוסטים`);
  }

  const usageText =
    parts.length > 0 ? parts.join(" ו-") : `${breakdown.total} פריטים`;

  return `לא ניתן למחוק תגית המשויכת ל-${usageText}.`;
}

async function validateUniqueFields(
  input: TagInput,
  excludeId?: string
): Promise<TagActionResult> {
  const slugTaken = await isTagSlugTaken(input.slug, input.type, excludeId);

  if (slugTaken) {
    return {
      success: false,
      error: TAG_ERRORS.slugTaken,
      fieldErrors: { slug: TAG_ERRORS.slugTaken },
    };
  }

  const nameTaken = await isTagNameTaken(input.name, input.type, excludeId);

  if (nameTaken) {
    return {
      success: false,
      error: TAG_ERRORS.nameTaken,
      fieldErrors: { name: TAG_ERRORS.nameTaken },
    };
  }

  return { success: true };
}

function mapDatabaseError(error: {
  code?: string;
  message?: string;
}): TagActionResult {
  if (error.code === "23505") {
    if (error.message?.includes("slug")) {
      return {
        success: false,
        error: TAG_ERRORS.slugTaken,
        fieldErrors: { slug: TAG_ERRORS.slugTaken },
      };
    }

    return {
      success: false,
      error: TAG_ERRORS.nameTaken,
      fieldErrors: { name: TAG_ERRORS.nameTaken },
    };
  }

  if (error.code === "23503") {
    return {
      success: false,
      error: TAG_ERRORS.inUse,
    };
  }

  return {
    success: false,
    error: TAG_ERRORS.generic,
  };
}

export async function createTagAction(
  input: TagInput
): Promise<TagActionResult> {
  const parsed = createTagSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TAG_ERRORS.unauthorized };
  }

  const uniqueCheck = await validateUniqueFields(parsed.data);

  if (!uniqueCheck.success) {
    return uniqueCheck;
  }

  const { supabase } = adminContext;
  const { data, error } = await supabase
    .from("tags")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      type: parsed.data.type,
    })
    .select("id")
    .single();

  if (error || !data) {
    return mapDatabaseError(error ?? {});
  }

  revalidateTagPaths(data.id);

  return { success: true, data: { id: data.id } };
}

export async function updateTagAction(
  input: TagInput & { id: string }
): Promise<TagActionResult> {
  const parsed = updateTagSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TAG_ERRORS.unauthorized };
  }

  const existing = await fetchTagById(parsed.data.id);

  if (!existing) {
    return { success: false, error: TAG_ERRORS.notFound };
  }

  if (existing.type !== parsed.data.type) {
    return {
      success: false,
      error: TAG_ERRORS.typeImmutable,
      fieldErrors: { type: TAG_ERRORS.typeImmutable },
    };
  }

  const uniqueCheck = await validateUniqueFields(parsed.data, parsed.data.id);

  if (!uniqueCheck.success) {
    return uniqueCheck;
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("tags")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
    })
    .eq("id", parsed.data.id)
    .eq("type", parsed.data.type);

  if (error) {
    return mapDatabaseError(error);
  }

  revalidateTagPaths(parsed.data.id);

  return { success: true, data: { id: parsed.data.id } };
}

export async function deleteTagAction(input: {
  id: string;
}): Promise<TagActionResult> {
  const parsed = deleteTagSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: TAG_ERRORS.generic,
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TAG_ERRORS.unauthorized };
  }

  const existing = await fetchTagById(parsed.data.id);

  if (!existing) {
    return { success: false, error: TAG_ERRORS.notFound };
  }

  const breakdown = await getTagUsageBreakdown(existing.id);

  if (breakdown.total > 0) {
    return { success: false, error: buildInUseMessage(breakdown) };
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", existing.id)
    .eq("type", existing.type);

  if (error) {
    return mapDatabaseError(error);
  }

  revalidateTagPaths(existing.id);

  return { success: true };
}
