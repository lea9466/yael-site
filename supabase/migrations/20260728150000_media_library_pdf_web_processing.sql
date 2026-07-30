-- PDF web processing: keep original bytes; store a separate web-optimized
-- Storage object path on the same media_library row.
-- NOTE: Later reverted by 20260728160000_media_library_drop_pdf_web_processing.sql

alter table media_library
  add column if not exists processing_status text,
  add column if not exists processing_error text,
  add column if not exists processing_attempts integer not null default 0,
  add column if not exists content_sha256 text,
  add column if not exists web_storage_path text,
  add column if not exists web_size_bytes integer,
  add column if not exists external_job_id text;

alter table media_library
  drop constraint if exists media_library_processing_status_check;

alter table media_library
  add constraint media_library_processing_status_check
  check (
    processing_status is null
    or processing_status in ('uploaded', 'processing', 'ready', 'failed')
  );

alter table media_library
  drop constraint if exists media_library_web_size_bytes_check;

alter table media_library
  add constraint media_library_web_size_bytes_check
  check (web_size_bytes is null or web_size_bytes > 0);

create unique index if not exists media_library_web_storage_path_uidx
  on media_library (web_storage_path)
  where web_storage_path is not null;

create index if not exists media_library_content_sha256_idx
  on media_library (content_sha256)
  where content_sha256 is not null;

create index if not exists media_library_processing_status_idx
  on media_library (processing_status)
  where processing_status is not null;

comment on column media_library.processing_status is
  'PDF web conversion status: uploaded → processing → ready|failed. Null for non-PDF or legacy rows not yet queued.';

comment on column media_library.web_storage_path is
  'Optional browser-optimized PDF (sRGB) Storage path. Original remains in storage_path.';

update media_library
set processing_status = 'uploaded'
where mime_type = 'application/pdf'
  and processing_status is null
  and web_storage_path is null;
