-- Harden public.set_updated_at() against search_path injection.
-- Depends on 20260714160300_storage_public_media.sql.
--
-- Recreates the trigger function with a fixed empty search_path and
-- fully qualified object references. Existing triggers are unchanged.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
