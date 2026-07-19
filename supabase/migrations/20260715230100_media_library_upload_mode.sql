-- Track how each media file was stored (optimized WebP or validated original bytes).
-- Depends on 20260714160000_initial_schema.sql.

alter table media_library
  add column upload_mode text not null default 'optimized'
  constraint media_library_upload_mode_check
  check (upload_mode in ('optimized', 'original'));

comment on column media_library.upload_mode is
  'Upload mode: optimized (Sharp WebP pipeline) or original (validated source bytes preserved).';

create index idx_media_library_upload_mode on media_library(upload_mode);
