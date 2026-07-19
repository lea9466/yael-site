export const PUBLIC_MEDIA_BUCKET = "public-media";

export const MAX_IMAGE_WIDTH = 1600;

export const WEBP_QUALITY = 82;

/** Maximum source file size accepted before processing (30MB). */
export const MAX_SOURCE_UPLOAD_BYTES = 30 * 1024 * 1024;

/** Maximum number of files allowed in one upload batch (UI). */
export const MAX_BATCH_UPLOAD_FILES = 10;

/** Maximum concurrent single-file uploads from the client batch UI. */
export const MAX_BATCH_UPLOAD_CONCURRENCY = 2;

/**
 * Storage bucket file size limit (32MB).
 * Slightly above MAX_SOURCE_UPLOAD_BYTES for storage overhead.
 * Application validation remains at exactly 30MB.
 */
export const BUCKET_FILE_SIZE_LIMIT = 32 * 1024 * 1024;

export const UPLOAD_MODES = ["optimized", "original"] as const;

export type UploadMode = (typeof UPLOAD_MODES)[number];

export const ALLOWED_INPUT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** MIME types allowed in the public-media bucket. */
export const ALLOWED_STORAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const OUTPUT_MIME_TYPE = "image/webp";

export const OUTPUT_EXTENSION = "webp";

export const MIME_TO_EXTENSION: Record<
  (typeof ALLOWED_INPUT_MIME_TYPES)[number],
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Recommended minimum source width for full-quality Hero / banner images. */
export const MIN_FULL_QUALITY_HERO_SOURCE_WIDTH = 1440;

export const MEDIA_LIBRARY_SELECT_COLUMNS =
  "id, storage_path, file_name, original_file_name, mime_type, width, height, size_bytes, alt_text, uploaded_by, upload_mode, created_at";
