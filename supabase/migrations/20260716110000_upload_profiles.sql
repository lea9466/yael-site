-- Replace optimized/original upload modes with upload profiles: normal, hero, logo.
-- Depends on 20260715230100_media_library_upload_mode.sql.

update media_library
set upload_mode = 'normal'
where upload_mode = 'optimized';

update media_library
set upload_mode = 'hero'
where upload_mode = 'original';

alter table media_library
  drop constraint media_library_upload_mode_check;

alter table media_library
  alter column upload_mode set default 'normal';

alter table media_library
  add constraint media_library_upload_mode_check
  check (upload_mode in ('normal', 'hero', 'logo'));

comment on column media_library.upload_mode is
  'Upload profile: normal (1600px WebP), hero (2560px WebP), or logo (2000px sharp WebP with alpha).';
