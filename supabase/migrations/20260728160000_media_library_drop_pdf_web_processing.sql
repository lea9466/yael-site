-- Revert PDF web-processing columns (external conversion removed).

drop index if exists media_library_web_storage_path_uidx;
drop index if exists media_library_content_sha256_idx;
drop index if exists media_library_processing_status_idx;

alter table media_library
  drop constraint if exists media_library_processing_status_check,
  drop constraint if exists media_library_web_size_bytes_check;

alter table media_library
  drop column if exists processing_status,
  drop column if exists processing_error,
  drop column if exists processing_attempts,
  drop column if exists content_sha256,
  drop column if exists web_storage_path,
  drop column if exists web_size_bytes,
  drop column if exists external_job_id;
