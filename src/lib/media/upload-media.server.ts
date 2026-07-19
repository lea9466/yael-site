import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  MEDIA_LIBRARY_SELECT_COLUMNS,
  PUBLIC_MEDIA_BUCKET,
  type UploadMode,
} from "@/lib/media/constants";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import {
  processImageByUploadMode,
  sanitizeOriginalFileName,
} from "@/lib/media/process-image";
import type { MediaRecord, UploadMediaResult } from "@/lib/media/media-types";
import { uploadMediaSchema } from "@/lib/validations/media";

async function removeStorageObject(
  supabase: SupabaseClient,
  storagePath: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .remove([storagePath]);

  return !error;
}

type UploadMediaInput = {
  supabase: SupabaseClient;
  adminId: string;
  file: File;
  altText?: string;
  uploadMode?: UploadMode;
};

export async function uploadMediaFromFile({
  supabase,
  adminId,
  file,
  altText,
  uploadMode = "optimized",
}: UploadMediaInput): Promise<UploadMediaResult> {
  if (file.size === 0) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  const parsedMeta = uploadMediaSchema.safeParse({ altText, uploadMode });

  if (!parsedMeta.success) {
    const firstIssue = parsedMeta.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? MEDIA_ERRORS.generic,
    };
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processImageByUploadMode(
      inputBuffer,
      file.type,
      parsedMeta.data.uploadMode
    );

    if (!processed.success) {
      return { success: false, error: processed.error };
    }

    const { image } = processed;
    const originalFileName = sanitizeOriginalFileName(file.name);

    const { error: uploadError } = await supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .upload(image.storagePath, image.buffer, {
        contentType: image.mimeType,
        upsert: false,
        cacheControl: "31536000",
      });

    if (uploadError) {
      return { success: false, error: MEDIA_ERRORS.generic };
    }

    const { data: inserted, error: insertError } = await supabase
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
        uploaded_by: adminId,
        upload_mode: parsedMeta.data.uploadMode,
      })
      .select(MEDIA_LIBRARY_SELECT_COLUMNS)
      .single();

    if (insertError || !inserted) {
      await removeStorageObject(supabase, image.storagePath);

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
