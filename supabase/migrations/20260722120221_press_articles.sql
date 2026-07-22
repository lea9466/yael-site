-- Press articles module + PDF support in the existing media library / public-media bucket.
-- No new storage bucket. No new media table.

-- ============================================================
-- 1. Allow application/pdf in media_library and storage
-- ============================================================

alter table media_library
  drop constraint media_library_mime_type_check;

alter table media_library
  add constraint media_library_mime_type_check
  check (
    mime_type in (
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf'
    )
  );

update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
where id = 'public-media';

-- ============================================================
-- 2. press_articles
-- ============================================================

create table press_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  slug text not null default '',
  excerpt text,
  publication_name text not null default '',
  published_at timestamptz,
  cover_media_id uuid references media_library(id) on delete restrict,
  pdf_media_id uuid references media_library(id) on delete restrict,
  display_order integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint press_articles_slug_format_check
    check (
      slug = ''
      or slug ~ '^[א-תa-z0-9]+(-[א-תa-z0-9]+)*$'
    ),
  constraint press_articles_title_length_check
    check (char_length(title) <= 200),
  constraint press_articles_slug_length_check
    check (char_length(slug) <= 120),
  constraint press_articles_excerpt_length_check
    check (excerpt is null or char_length(excerpt) <= 500),
  constraint press_articles_publication_name_length_check
    check (char_length(publication_name) <= 160),
  constraint press_articles_seo_title_length_check
    check (seo_title is null or char_length(seo_title) <= 70),
  constraint press_articles_seo_description_length_check
    check (seo_description is null or char_length(seo_description) <= 160),
  constraint press_articles_published_requires_fields_check
    check (
      status = 'draft'
      or (
        char_length(trim(title)) > 0
        and char_length(trim(slug)) > 0
        and char_length(trim(publication_name)) > 0
        and published_at is not null
        and pdf_media_id is not null
      )
    )
);

comment on table press_articles is
  'Press articles and interviews. PDF and cover images reference media_library ids only.';

create unique index press_articles_slug_unique
  on press_articles (slug)
  where slug <> '';

create index idx_press_articles_status on press_articles(status);
create index idx_press_articles_published_at on press_articles(published_at desc nulls last);
create index idx_press_articles_display_order on press_articles(display_order asc, published_at desc nulls last);
create index idx_press_articles_cover_media_id on press_articles(cover_media_id);
create index idx_press_articles_pdf_media_id on press_articles(pdf_media_id);

create trigger trg_press_articles_updated_at
  before update on press_articles
  for each row execute function set_updated_at();

alter table press_articles enable row level security;

create policy press_articles_public_select on press_articles
  for select to anon, authenticated
  using (status = 'published');

create policy press_articles_admin_all on press_articles
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- Explicit privileges (see 20260714160200_permissions.sql).
grant select on public.press_articles to anon, authenticated;
grant insert, update, delete on public.press_articles to authenticated;