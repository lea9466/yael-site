import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_UPLOAD_PROFILE,
  MEDIA_LIBRARY_SELECT_COLUMNS,
  PUBLIC_MEDIA_BUCKET,
  type UploadProfile,
} from "@/lib/media/constants";
import { MEDIA_ERRORS } from "@/lib/media/media-errors";
import {
  processImageByProfile,
  sanitizeOriginalFileName,
} from "@/lib/media/process-image";
import {
  isHeroVideoMimeType,
  processHeroVideoBuffer,
} from "@/lib/media/process-video";
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
  uploadProfile?: UploadProfile;
};

export async function uploadMediaFromFile({
  supabase,
  adminId,
  file,
  altText,
  uploadProfile = DEFAULT_UPLOAD_PROFILE,
}: UploadMediaInput): Promise<UploadMediaResult> {
  if (file.size === 0) {
    return { success: false, error: MEDIA_ERRORS.invalidFile };
  }

  const parsedMeta = uploadMediaSchema.safeParse({ altText, uploadProfile });

  if (!parsedMeta.success) {
    const firstIssue = parsedMeta.error.issues[0];

    return {
      success: false,
      error: firstIssue?.message ?? MEDIA_ERRORS.generic,
    };
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    if (isHeroVideoMimeType(file.type)) {
      if (parsedMeta.data.uploadProfile !== "hero") {
        return { success: false, error: MEDIA_ERRORS.invalidFile };
      }

      const processed = await processHeroVideoBuffer(inputBuffer, file.type);

      if (!processed.success) {
        return { success: false, error: processed.error };
      }

      return persistProcessedMedia(
        supabase,
        adminId,
        file.name,
        parsedMeta.data,
        processed.image
      );
    }

    const processed = await processImageByProfile(
      inputBuffer,
      file.type,
      parsedMeta.data.uploadProfile
    );

    if (!processed.success) {
      return { success: false, error: processed.error };
    }

    return persistProcessedMedia(
      supabase,
      adminId,
      file.name,
      parsedMeta.data,
      processed.image
    );
  } catch {
    return { success: false, error: MEDIA_ERRORS.generic };
  }
}

async function persistProcessedMedia(
  supabase: SupabaseClient,
  adminId: string,
  originalName: string,
  parsedMeta: { altText?: string; uploadProfile: UploadProfile },
  image: {
    buffer: Buffer;
    width: number;
    height: number;
    sizeBytes: number;
    mimeType: string;
    fileName: string;
    storagePath: string;
  }
): Promise<UploadMediaResult> {
  const originalFileName = sanitizeOriginalFileName(originalName);

  // Prefer Blob so storage-js uses multipart FormData (reliable in Node fetch).
  const uploadBody = new Blob([Uint8Array.from(image.buffer)], {
    type: image.mimeType,
  });

  const { error: uploadError } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(image.storagePath, uploadBody, {
      contentType: image.mimeType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) {
    console.error("[media/upload] storage upload failed", uploadError.message);
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
      alt_text: parsedMeta.altText ?? null,
      uploaded_by: adminId,
      upload_mode: parsedMeta.uploadProfile,
    })
    .select(MEDIA_LIBRARY_SELECT_COLUMNS)
    .single();

  if (insertError || !inserted) {
    console.error(
      "[media/upload] media_library insert failed",
      insertError?.code,
      insertError?.message
    );
    await removeStorageObject(supabase, image.storagePath);

    return { success: false, error: MEDIA_ERRORS.generic };
  }

  return {
    success: true,
    media: inserted as MediaRecord,
  };
}
