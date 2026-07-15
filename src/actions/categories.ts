"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { CATEGORY_ERRORS } from "@/lib/categories/errors";
import {
  fetchCategoryById,
  getCategoryUsageCount,
  isCategoryNameTaken,
  isCategorySlugTaken,
} from "@/lib/categories/queries";
import type { CategoryActionResult } from "@/lib/categories/types";
import { verifyMediaExists } from "@/lib/services/queries";
import {
  createCategorySchema,
  deleteCategorySchema,
  mapZodErrors,
  updateCategorySchema,
  type CategoryInput,
} from "@/lib/validations/category";

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

function revalidateCategoryPaths(categoryId?: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/recipes", "layout");

  if (categoryId) {
    revalidatePath(`/admin/categories/${categoryId}`);
  }
}

async function validateImageMedia(
  imageMediaId: string | null
): Promise<CategoryActionResult> {
  if (!imageMediaId) {
    return { success: true };
  }

  const exists = await verifyMediaExists(imageMediaId);

  if (!exists) {
    return {
      success: false,
      error: CATEGORY_ERRORS.mediaNotFound,
      fieldErrors: { image_media_id: CATEGORY_ERRORS.mediaNotFound },
    };
  }

  return { success: true };
}

async function validateUniqueFields(
  input: CategoryInput,
  excludeId?: string
): Promise<CategoryActionResult> {
  const slugTaken = await isCategorySlugTaken(input.slug, input.type, excludeId);

  if (slugTaken) {
    return {
      success: false,
      error: CATEGORY_ERRORS.slugTaken,
      fieldErrors: { slug: CATEGORY_ERRORS.slugTaken },
    };
  }

  const nameTaken = await isCategoryNameTaken(input.name, input.type, excludeId);

  if (nameTaken) {
    return {
      success: false,
      error: CATEGORY_ERRORS.nameTaken,
      fieldErrors: { name: CATEGORY_ERRORS.nameTaken },
    };
  }

  return { success: true };
}

function mapDatabaseError(error: {
  code?: string;
  message?: string;
}): CategoryActionResult {
  if (error.code === "23505") {
    if (error.message?.includes("slug")) {
      return {
        success: false,
        error: CATEGORY_ERRORS.slugTaken,
        fieldErrors: { slug: CATEGORY_ERRORS.slugTaken },
      };
    }

    return {
      success: false,
      error: CATEGORY_ERRORS.nameTaken,
      fieldErrors: { name: CATEGORY_ERRORS.nameTaken },
    };
  }

  if (error.code === "23503") {
    return {
      success: false,
      error: CATEGORY_ERRORS.inUse,
    };
  }

  return {
    success: false,
    error: CATEGORY_ERRORS.generic,
  };
}

export async function createCategoryAction(
  input: CategoryInput
): Promise<CategoryActionResult> {
  const parsed = createCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: CATEGORY_ERRORS.unauthorized };
  }

  const uniqueCheck = await validateUniqueFields(parsed.data);

  if (!uniqueCheck.success) {
    return uniqueCheck;
  }

  const imageCheck = await validateImageMedia(parsed.data.image_media_id ?? null);

  if (!imageCheck.success) {
    return imageCheck;
  }

  const { supabase } = adminContext;
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      type: parsed.data.type,
      image_media_id: parsed.data.image_media_id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return mapDatabaseError(error ?? {});
  }

  revalidateCategoryPaths(data.id);

  return { success: true, data: { id: data.id } };
}

export async function updateCategoryAction(
  input: CategoryInput & { id: string }
): Promise<CategoryActionResult> {
  const parsed = updateCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: CATEGORY_ERRORS.unauthorized };
  }

  const existing = await fetchCategoryById(parsed.data.id);

  if (!existing) {
    return { success: false, error: CATEGORY_ERRORS.notFound };
  }

  if (existing.type !== parsed.data.type) {
    return {
      success: false,
      error: CATEGORY_ERRORS.typeImmutable,
      fieldErrors: { type: CATEGORY_ERRORS.typeImmutable },
    };
  }

  const uniqueCheck = await validateUniqueFields(parsed.data, parsed.data.id);

  if (!uniqueCheck.success) {
    return uniqueCheck;
  }

  const imageCheck = await validateImageMedia(parsed.data.image_media_id ?? null);

  if (!imageCheck.success) {
    return imageCheck;
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      image_media_id: parsed.data.image_media_id ?? null,
    })
    .eq("id", parsed.data.id)
    .eq("type", parsed.data.type);

  if (error) {
    return mapDatabaseError(error);
  }

  revalidateCategoryPaths(parsed.data.id);

  return { success: true, data: { id: parsed.data.id } };
}

export async function deleteCategoryAction(input: {
  id: string;
}): Promise<CategoryActionResult> {
  const parsed = deleteCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: CATEGORY_ERRORS.generic,
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: CATEGORY_ERRORS.unauthorized };
  }

  const existing = await fetchCategoryById(parsed.data.id);

  if (!existing) {
    return { success: false, error: CATEGORY_ERRORS.notFound };
  }

  const usageCount = await getCategoryUsageCount(existing.id, existing.type);

  if (usageCount > 0) {
    return { success: false, error: CATEGORY_ERRORS.inUse };
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", existing.id)
    .eq("type", existing.type);

  if (error) {
    return mapDatabaseError(error);
  }

  revalidateCategoryPaths(existing.id);

  return { success: true };
}
