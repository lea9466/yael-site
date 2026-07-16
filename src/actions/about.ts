"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { ABOUT_ERRORS } from "@/lib/about/errors";
import { ABOUT_SITE_CONTENT_KEY } from "@/lib/about/constants";
import { verifyMediaExists } from "@/lib/services/queries";
import {
  collectAboutContentMediaIds,
  mapZodErrors,
  saveAboutPageInputSchema,
  toAboutPageDataForSave,
  type AboutActionResult,
} from "@/lib/validations/about";

async function getAdminSupabase(): Promise<{ supabase: SupabaseClient } | null> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const supabase = await createClient();

  return { supabase };
}

function revalidateAboutPaths() {
  revalidatePath("/admin/about");
  revalidatePath("/admin/about/preview");
}

async function validateMediaIds(
  coverMediaId: string | null,
  contentMediaIds: string[]
): Promise<AboutActionResult | null> {
  const uniqueIds = [...new Set([...contentMediaIds, coverMediaId].filter(Boolean))];

  for (const mediaId of uniqueIds) {
    const exists = await verifyMediaExists(mediaId as string);

    if (!exists) {
      return {
        success: false,
        error: ABOUT_ERRORS.invalidMedia,
        fieldErrors: { cover_media_id: ABOUT_ERRORS.invalidMedia },
      };
    }
  }

  return null;
}

export async function saveAboutPageAction(
  input: unknown
): Promise<AboutActionResult> {
  const parsed = saveAboutPageInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: ABOUT_ERRORS.unauthorized };
  }

  const dataForSave = toAboutPageDataForSave(parsed.data.data);
  const contentMediaIds = collectAboutContentMediaIds(dataForSave.content);

  const mediaError = await validateMediaIds(
    dataForSave.cover_media_id,
    contentMediaIds
  );

  if (mediaError) {
    return mediaError;
  }

  const { data: row, error } = await adminContext.supabase
    .from("site_content")
    .update({ data: dataForSave })
    .eq("key", ABOUT_SITE_CONTENT_KEY)
    .eq("updated_at", parsed.data.updatedAt)
    .select("updated_at")
    .maybeSingle();

  if (error) {
    return { success: false, error: ABOUT_ERRORS.generic };
  }

  if (!row) {
    return { success: false, error: ABOUT_ERRORS.conflict };
  }

  revalidateAboutPaths();

  return {
    success: true,
    data: {
      updatedAt: row.updated_at,
    },
  };
}
