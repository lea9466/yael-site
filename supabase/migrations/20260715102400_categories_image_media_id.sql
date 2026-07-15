-- Add optional category image reference to media_library.
-- Depends on 20260714160000_initial_schema.sql.
--
-- RLS impact: none — existing categories_admin_all policy covers all columns.
-- GRANT impact: none — categories already has insert/update/delete for authenticated.
-- Media deletion: ON DELETE RESTRICT blocks deleting referenced media files.

alter table public.categories
  add column image_media_id uuid null
  references public.media_library (id) on delete restrict;

create index idx_categories_image_media_id
  on public.categories (image_media_id)
  where image_media_id is not null;

comment on column public.categories.image_media_id is
  'Optional category image for public display. Clearing the field does not delete the media file.';
