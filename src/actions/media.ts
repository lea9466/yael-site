"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { deleteMediaItem } from "@/lib/media/delete-media.server";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import { uploadMediaFromFile } from "@/lib/media/upload-media.server";
import type {
  BulkDeleteMediaResult,
  DeleteMediaResult,
  MediaListItem,
  MediaRecord,
  UpdateMediaAltTextResult,
  UploadMediaResult,
} from "@/lib/media/media-types";
import { fetchMediaLibrary } from "@/lib/media/queries";
import { getAuthenticatedAdmin, createClient } from "@/lib/auth/session";
import { MAX_BATCH_UPLOAD_CONCURRENCY, MEDIA_LIBRARY_SELECT_COLUMNS } from "@/lib/media/constants";
import {
  bulkDeleteMediaSchema,
  deleteMediaSchema,
  listMediaQuerySchema,
  updateMediaAltTextSchema,
  uploadMediaSchema,
} from "@/lib/validations/media";

async function getAdminSupabase(): Promise<{
  supabase: SupabaseClient;
  adminId: string;
} | null> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const supabase = await createClient();

  return {
    supabase,
    adminId: admin.id,
  };
}

export async function uploadMediaAction(
  formData: FormData
): Promise<UploadMediaResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: MEDIA_ERRORS.unauthorized };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: MEDIA_ERRORS.missingFile };
  }

  if (file.size === 0) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  const parsedMeta = uploadMediaSchema.safeParse({
    altText: formData.get("altText")?.toString() ?? undefined,
    uploadProfile: formData.get("uploadProfile")?.toString(),
  });

  if (!parsedMeta.success) {
    const firstIssue = parsedMeta.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? MEDIA_ERRORS.generic,
    };
  }

  return uploadMediaFromFile({
    supabase: session.supabase,
    adminId: session.adminId,
    file,
    altText: parsedMeta.data.altText,
    uploadProfile: parsedMeta.data.uploadProfile,
  });
}

export async function deleteMediaAction(
  mediaId: string
): Promise<DeleteMediaResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: MEDIA_ERRORS.unauthorized };
  }

  const parsed = deleteMediaSchema.safeParse({ mediaId });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? MEDIA_ERRORS.generic,
    };
  }

  const result = await deleteMediaItem(session.supabase, parsed.data.mediaId);

  if (result.outcome === "deleted") {
    return { success: true };
  }

  if (result.outcome === "blocked") {
    return {
      success: false,
      error: MEDIA_ERRORS.deleteInUse,
      usages: result.usages,
    };
  }

  return {
    success: false,
    error: result.message,
  };
}

async function processBulkDelete(
  supabase: SupabaseClient,
  mediaIds: string[]
): Promise<BulkDeleteMediaResult> {
  const result: BulkDeleteMediaResult = {
    deleted: [],
    blocked: [],
    failed: [],
  };

  let index = 0;

  async function worker(): Promise<void> {
    while (index < mediaIds.length) {
      const currentIndex = index;
      index += 1;
      const mediaId = mediaIds[currentIndex];
      const itemResult = await deleteMediaItem(supabase, mediaId);

      if (itemResult.outcome === "deleted") {
        result.deleted.push({
          id: itemResult.id,
          fileName: itemResult.fileName,
        });
      } else if (itemResult.outcome === "blocked") {
        result.blocked.push({
          id: itemResult.id,
          fileName: itemResult.fileName,
          usages: itemResult.usages,
        });
      } else {
        result.failed.push({
          id: itemResult.id,
          fileName: itemResult.fileName,
          message: itemResult.message,
        });
      }
    }
  }

  const workerCount = Math.min(MAX_BATCH_UPLOAD_CONCURRENCY, mediaIds.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return result;
}

export async function bulkDeleteMediaAction(
  mediaIds: string[]
): Promise<BulkDeleteMediaResult | { error: string }> {
  const session = await getAdminSupabase();

  if (!session) {
    return { error: MEDIA_ERRORS.unauthorized };
  }

  const parsed = bulkDeleteMediaSchema.safeParse({ mediaIds });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      error: firstIssue?.message ?? MEDIA_ERRORS.generic,
    };
  }

  return processBulkDelete(session.supabase, parsed.data.mediaIds);
}

export async function updateMediaAltTextAction(
  mediaId: string,
  altText: string
): Promise<UpdateMediaAltTextResult> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, error: MEDIA_ERRORS.unauthorized };
  }

  const parsed = updateMediaAltTextSchema.safeParse({ mediaId, altText });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? MEDIA_ERRORS.generic,
    };
  }

  try {
    const { data: updated, error } = await session.supabase
      .from("media_library")
      .update({ alt_text: parsed.data.altText })
      .eq("id", parsed.data.mediaId)
      .select(MEDIA_LIBRARY_SELECT_COLUMNS)
      .maybeSingle();

    if (error) {
      return { success: false, error: MEDIA_ERRORS.generic };
    }

    if (!updated) {
      return { success: false, error: MEDIA_ERRORS.deleteNotFound };
    }

    return {
      success: true,
      media: updated as MediaRecord,
    };
  } catch {
    return { success: false, error: MEDIA_ERRORS.generic };
  }
}

export async function searchMediaPickerAction(
  q = "",
  page = 1,
  mime: "all" | "image" | "pdf" = "all"
): Promise<{
  success: boolean;
  items: MediaListItem[];
  totalPages: number;
  error?: string;
}> {
  const session = await getAdminSupabase();

  if (!session) {
    return { success: false, items: [], totalPages: 1, error: MEDIA_ERRORS.unauthorized };
  }

  const parsed = listMediaQuerySchema.safeParse({ q, page, sort: "newest", mime });

  if (!parsed.success) {
    return { success: false, items: [], totalPages: 1, error: MEDIA_ERRORS.generic };
  }

  const data = await fetchMediaLibrary(parsed.data);

  if (!data) {
    return { success: false, items: [], totalPages: 1, error: MEDIA_ERRORS.generic };
  }

  return {
    success: true,
    items: data.items,
    totalPages: data.pagination.totalPages,
  };
}
