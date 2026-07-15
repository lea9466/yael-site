export const PUBLIC_MEDIA_BUCKET = "public-media";

export const MAX_IMAGE_WIDTH = 1600;

export const WEBP_QUALITY = 82;

/** Maximum source file size accepted before Sharp processing (30MB). */
export const MAX_SOURCE_UPLOAD_BYTES = 30 * 1024 * 1024;

/** Maximum number of files allowed in one upload batch (UI). */
export const MAX_BATCH_UPLOAD_FILES = 10;

/** Maximum concurrent single-file uploads from the client batch UI. */
export const MAX_BATCH_UPLOAD_CONCURRENCY = 2;

/**
 * Storage bucket limit for the optimized file stored in Supabase (5MB).
 * Enforced by storage.buckets.file_size_limit after server-side processing.
 */
export const BUCKET_OPTIMIZED_FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export const ALLOWED_INPUT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** MIME types allowed in the public-media bucket (optimized output only). */
export const ALLOWED_STORAGE_MIME_TYPES = ["image/webp"] as const;

export const OUTPUT_MIME_TYPE = "image/webp";

export const OUTPUT_EXTENSION = "webp";
