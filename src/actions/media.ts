"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { PUBLIC_MEDIA_BUCKET } from "@/lib/media/constants";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import { findMediaUsages } from "@/lib/media/check-usage";
import {
  processImageBuffer,
  sanitizeOriginalFileName,
} from "@/lib/media/process-image";
import type {
  DeleteMediaResult,
  MediaRecord,
  UploadMediaResult,
} from "@/lib/media/media-types";
import { getAuthenticatedAdmin, createClient } from "@/lib/auth/session";
import {
  deleteMediaSchema,
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

async function removeStorageObject(
  supabase: SupabaseClient,
  storagePath: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .remove([storagePath]);

  return !error;
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

  const parsedMeta = uploadMediaSchema.safeParse({
    altText: formData.get("altText")?.toString() ?? undefined,
  });

  if (!parsedMeta.success) {
    const firstIssue = parsedMeta.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? MEDIA_ERRORS.generic,
    };
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processImageBuffer(inputBuffer, file.type);

    if (!processed.success) {
      return { success: false, error: processed.error };
    }

    const { image } = processed;
    const originalFileName = sanitizeOriginalFileName(file.name);

    const { error: uploadError } = await session.supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .upload(image.storagePath, image.buffer, {
        contentType: image.mimeType,
        upsert: false,
        cacheControl: "31536000",
      });

    if (uploadError) {
      return { success: false, error: MEDIA_ERRORS.generic };
    }

    const { data: inserted, error: insertError } = await session.supabase
      .from("media_library")
      .insert({
        storage_path: image.storagePath,
        file_name: image.fileName,
        original_file_name: originalFileName,
        mime_type: image.mimeType,
        width: image.width,
        height: image.height,
        size_bytes: image.sizeBytes,
        alt_text: parsedMeta.data.altText ?? null,
        uploaded_by: session.adminId,
      })
      .select(
        "id, storage_path, file_name, original_file_name, mime_type, width, height, size_bytes, alt_text, uploaded_by, created_at"
      )
      .single();

    if (insertError || !inserted) {
      await removeStorageObject(session.supabase, image.storagePath);

      return { success: false, error: MEDIA_ERRORS.generic };
    }

    return {
      success: true,
      media: inserted as MediaRecord,
    };
  } catch {
    return { success: false, error: MEDIA_ERRORS.generic };
  }
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

  try {
    const { data: mediaRow, error: loadError } = await session.supabase
      .from("media_library")
      .select("id, storage_path")
      .eq("id", parsed.data.mediaId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: MEDIA_ERRORS.generic };
    }

    if (!mediaRow) {
      return { success: false, error: MEDIA_ERRORS.deleteNotFound };
    }

    const usages = await findMediaUsages(session.supabase, parsed.data.mediaId);

    if (usages.length > 0) {
      return {
        success: false,
        error: MEDIA_ERRORS.deleteInUse,
        usages,
      };
    }

    const storageDeleted = await removeStorageObject(
      session.supabase,
      mediaRow.storage_path
    );

    if (!storageDeleted) {
      return { success: false, error: MEDIA_ERRORS.generic };
    }

    const { error: deleteError } = await session.supabase
      .from("media_library")
      .delete()
      .eq("id", parsed.data.mediaId);

    if (deleteError) {
      return { success: false, error: MEDIA_ERRORS.generic };
    }

    return { success: true };
  } catch {
    return { success: false, error: MEDIA_ERRORS.generic };
  }
}
