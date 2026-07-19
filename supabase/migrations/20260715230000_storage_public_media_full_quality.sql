-- Extend public-media bucket for full-quality JPEG/PNG/WebP uploads.
-- Depends on 20260714160300_storage_public_media.sql.
--
-- Application validation remains 30MB per source file (MAX_SOURCE_UPLOAD_BYTES).
-- Bucket file_size_limit is set to 32MB for storage overhead.
-- Storage policies are unchanged.

update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
  file_size_limit = 33554432
where id = 'public-media';
