-- Simplify upload profiles to normal and hero; migrate legacy upload modes.
-- Allow hero video uploads (MP4/WebM) in media_library and storage bucket.
-- Depends on 20260715230100_media_library_upload_mode.sql.

alter table media_library
  drop constraint media_library_upload_mode_check;

update media_library
set upload_mode = 'normal'
where upload_mode in ('optimized', 'logo');

update media_library
set upload_mode = 'hero'
where upload_mode = 'original';

alter table media_library
  alter column upload_mode set default 'normal';

alter table media_library
  add constraint media_library_upload_mode_check
  check (upload_mode in ('normal', 'hero'));

comment on column media_library.upload_mode is
  'Upload profile: normal (1600px WebP) or hero (2560px WebP / optional MP4 WebM video).';

alter table media_library
  drop constraint media_library_mime_type_check;

alter table media_library
  add constraint media_library_mime_type_check
  check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'));

alter table media_library
  drop constraint media_library_width_check;

alter table media_library
  add constraint media_library_width_check
  check (width >= 0);

alter table media_library
  drop constraint media_library_height_check;

alter table media_library
  add constraint media_library_height_check
  check (height >= 0);

update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
where id = 'public-media';
