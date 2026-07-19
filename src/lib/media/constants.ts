export {
  DEFAULT_UPLOAD_PROFILE,
  UPLOAD_PROFILES,
  UPLOAD_PROFILE_BADGE_LABELS,
  UPLOAD_PROFILE_PROCESSING,
  UPLOAD_PROFILE_UI,
  type UploadProfile,
} from "@/lib/media/upload-profiles";

export const PUBLIC_MEDIA_BUCKET = "public-media";

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

export const ALLOWED_INPUT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const HERO_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export type HeroVideoMimeType = (typeof HERO_VIDEO_MIME_TYPES)[number];

export const VIDEO_EXTENSION_BY_MIME: Record<HeroVideoMimeType, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** MIME types allowed in the public-media bucket. */
export const ALLOWED_STORAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
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

export const MEDIA_LIBRARY_SELECT_COLUMNS =
  "id, storage_path, file_name, original_file_name, mime_type, width, height, size_bytes, alt_text, uploaded_by, upload_mode, created_at";
