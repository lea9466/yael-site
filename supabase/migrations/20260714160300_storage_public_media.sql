-- Storage bucket and policies for public website images.
-- Depends on 20260714160100_rls_policies.sql (public.is_admin()).
--
-- Public bucket URLs serve assets without a storage.objects SELECT policy.
-- Only optimized WebP files are stored; source JPEG/PNG/WebP are validated
-- in server-side code before Sharp processing.

-- ============================================================
-- Bucket: public-media
-- Public read via bucket URL. Optimized output size limit (5MB).
-- Source uploads up to 30MB are rejected in server-side code
-- before Sharp processing; only optimized WebP is stored here.
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'public-media',
  'public-media',
  true,
  5242880,
  array['image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- Storage policies on storage.objects
-- ============================================================

create policy public_media_admin_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'public-media'
    and public.is_admin()
  );

create policy public_media_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'public-media'
    and public.is_admin()
  );

create policy public_media_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'public-media'
    and public.is_admin()
  )
  with check (
    bucket_id = 'public-media'
    and public.is_admin()
  );

create policy public_media_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'public-media'
    and public.is_admin()
  );
