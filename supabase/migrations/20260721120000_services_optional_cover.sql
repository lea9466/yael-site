-- Allow draft services without a cover image.
-- Content fields remain NOT NULL as empty strings; cover is the only FK that blocked empty drafts.

alter table services
  alter column cover_media_id drop not null;
