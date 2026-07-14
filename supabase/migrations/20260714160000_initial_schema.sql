-- Initial schema for yael-site: enums, tables, constraints, indexes,
-- triggers and updated_at handling. RLS is enabled on every table here,
-- but the actual policies live in 20260714160100_rls_policies.sql.
--
-- Do not run this migration until it has been reviewed and approved.

-- ============================================================
-- Extensions
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Enums
-- ============================================================

create type content_status as enum ('draft', 'published', 'archived');

-- ============================================================
-- Shared trigger function: keep updated_at current on every UPDATE
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. admin_users
-- Authorization source for the single administrator.
-- email is optional, display-only data — not unique, not used for lookups.
-- ============================================================

create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table admin_users is
  'Authorization source for the single administrator (see is_admin() in the RLS migration). '
  'email is optional, display-only data — not unique, not used for auth or lookups. '
  'Rows are provisioned only via service-role/server-side code, never via anon/authenticated INSERT.';

alter table admin_users enable row level security;

-- ============================================================
-- 12. media_library
-- Restored so the admin can reuse existing images and media can be
-- safely checked for usage before deletion. Created before
-- services/recipes/articles, which reference it.
-- ============================================================

create table media_library (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  file_name text not null,
  original_file_name text,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  width smallint not null check (width > 0),
  height smallint not null check (height > 0),
  size_bytes integer not null check (size_bytes > 0),
  alt_text text,
  uploaded_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table media_library is
  'Central media catalog. Deletion is allowed only through a protected server-side action that: '
  '(1) relies on the hard FK + ON DELETE RESTRICT from services/recipes/articles.cover_media_id and '
  '.seo_og_media_id — Postgres blocks the delete automatically when one of those references exists; '
  '(2) additionally scans every JSONB column that may embed a media id — recipes.content->''gallery'', '
  'articles.content->''gallery'', and site_content.data for all five keys (hero/about cover/business '
  'logo/site_settings OG image/certificate images) — since Postgres cannot enforce a foreign key inside '
  'JSONB; (3) blocks the delete and reports "still in use" if step (1) or (2) finds any reference; '
  '(4) only when confirmed unused, deletes the Supabase Storage object first, then this row, in that order.';

create index idx_media_library_mime_type on media_library(mime_type);
create index idx_media_library_created_at on media_library(created_at desc);
create index idx_media_library_uploaded_by on media_library(uploaded_by);

create trigger trg_media_library_updated_at
  before update on media_library
  for each row execute function set_updated_at();

alter table media_library enable row level security;

-- ============================================================
-- 6. categories
-- Single table shared by recipes and articles, scoped by type.
-- unique(id, type) exists solely to support the composite foreign
-- keys from recipes/articles that pin category_id to the right type.
-- ============================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('recipe', 'article')),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (type, slug),
  unique (type, name),
  unique (id, type)
);

alter table categories enable row level security;

-- ============================================================
-- 7. tags
-- Single table shared by recipes and articles, scoped by type.
-- unique(id, type) supports the composite foreign keys from
-- recipe_tags/article_tags.
-- ============================================================

create table tags (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('recipe', 'article')),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (type, slug),
  unique (type, name),
  unique (id, type)
);

alter table tags enable row level security;

-- ============================================================
-- 3. services
-- ============================================================

create table services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null,
  full_introduction text not null,
  cover_media_id uuid not null references media_library(id) on delete restrict,
  seo_og_media_id uuid references media_library(id) on delete restrict,
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object'),
  featured boolean not null default false,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_status_published on services(status) where status = 'published';
create index idx_services_featured on services(featured) where featured = true;
create index idx_services_published_at on services(published_at desc);
create index idx_services_cover_media_id on services(cover_media_id);
create index idx_services_seo_og_media_id on services(seo_og_media_id);

create trigger trg_services_updated_at
  before update on services
  for each row execute function set_updated_at();

alter table services enable row level security;

-- ============================================================
-- 4. recipes
-- category_type/composite FK guarantees category_id can only point
-- to a categories row where type = 'recipe' — enforced by Postgres,
-- no trigger required.
-- ============================================================

create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null,
  cover_media_id uuid not null references media_library(id) on delete restrict,
  seo_og_media_id uuid references media_library(id) on delete restrict,
  category_id uuid not null,
  category_type text not null default 'recipe' check (category_type = 'recipe'),
  duration_minutes smallint not null check (duration_minutes > 0),
  servings smallint not null check (servings > 0),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object'),
  featured boolean not null default false,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (category_id, category_type) references categories(id, type) on delete restrict
);

comment on column recipes.category_type is
  'Always ''recipe'' — pinned by the CHECK constraint. Exists only so the composite foreign key '
  'above can guarantee category_id points to a categories row where categories.type = ''recipe''. '
  'The application never needs to set this column; the default handles it.';

create index idx_recipes_category_id on recipes(category_id);
create index idx_recipes_status_published on recipes(status) where status = 'published';
create index idx_recipes_featured on recipes(featured) where featured = true;
create index idx_recipes_published_at on recipes(published_at desc);
create index idx_recipes_cover_media_id on recipes(cover_media_id);
create index idx_recipes_seo_og_media_id on recipes(seo_og_media_id);

create trigger trg_recipes_updated_at
  before update on recipes
  for each row execute function set_updated_at();

alter table recipes enable row level security;

-- ============================================================
-- 5. articles
-- Same composite-FK pattern as recipes, pinned to type = 'article'.
-- ============================================================

create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  body text not null,
  cover_media_id uuid not null references media_library(id) on delete restrict,
  seo_og_media_id uuid references media_library(id) on delete restrict,
  category_id uuid not null,
  category_type text not null default 'article' check (category_type = 'article'),
  reading_time_minutes smallint not null check (reading_time_minutes >= 1),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object'),
  featured boolean not null default false,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (category_id, category_type) references categories(id, type) on delete restrict
);

comment on column articles.category_type is
  'Always ''article'' — pinned by the CHECK constraint, mirroring recipes.category_type.';

create index idx_articles_category_id on articles(category_id);
create index idx_articles_status_published on articles(status) where status = 'published';
create index idx_articles_featured on articles(featured) where featured = true;
create index idx_articles_published_at on articles(published_at desc);
create index idx_articles_cover_media_id on articles(cover_media_id);
create index idx_articles_seo_og_media_id on articles(seo_og_media_id);

create trigger trg_articles_updated_at
  before update on articles
  for each row execute function set_updated_at();

alter table articles enable row level security;

-- ============================================================
-- 8. recipe_tags
-- Real FK join table (replaces the earlier polymorphic content_tags).
-- tag_type/composite FK guarantees tag_id can only point to a tags
-- row where type = 'recipe'.
-- ============================================================

create table recipe_tags (
  recipe_id uuid not null references recipes(id) on delete cascade,
  tag_id uuid not null,
  tag_type text not null default 'recipe' check (tag_type = 'recipe'),
  created_at timestamptz not null default now(),
  primary key (recipe_id, tag_id),
  foreign key (tag_id, tag_type) references tags(id, type) on delete cascade
);

create index idx_recipe_tags_tag_id on recipe_tags(tag_id);

alter table recipe_tags enable row level security;

-- ============================================================
-- 9. article_tags
-- Same pattern as recipe_tags, pinned to type = 'article'.
-- ============================================================

create table article_tags (
  article_id uuid not null references articles(id) on delete cascade,
  tag_id uuid not null,
  tag_type text not null default 'article' check (tag_type = 'article'),
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id),
  foreign key (tag_id, tag_type) references tags(id, type) on delete cascade
);

create index idx_article_tags_tag_id on article_tags(tag_id);

alter table article_tags enable row level security;

-- ============================================================
-- 10. testimonials
-- ============================================================

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  content text not null check (char_length(content) <= 2000),
  service_id uuid references services(id) on delete set null,
  featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_testimonials_published_featured on testimonials(is_published, featured);
create index idx_testimonials_service_id on testimonials(service_id);

create trigger trg_testimonials_updated_at
  before update on testimonials
  for each row execute function set_updated_at();

alter table testimonials enable row level security;

-- ============================================================
-- 11. contact_messages
-- No IP address column. Never used as a rate-limit ledger —
-- contact-form rate limiting is implemented separately at the
-- server layer (outside this schema).
-- ============================================================

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 200),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  message text not null check (char_length(message) <= 5000),
  privacy_policy_accepted boolean not null check (privacy_policy_accepted = true),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table contact_messages is
  'No IP address is stored and this table is never queried as a rate-limit ledger. '
  'Login rate limiting uses Supabase Auth configuration; contact-form rate limiting is '
  'implemented separately at the server layer.';

create index idx_contact_messages_created_at on contact_messages(created_at desc);
create index idx_contact_messages_is_read on contact_messages(is_read);

alter table contact_messages enable row level security;

-- ============================================================
-- 2. site_content
-- Flexible per-key content. The strict JSON Schema for every key is
-- documented in supabase/site-content-json-schemas.md and must be
-- enforced by a dedicated Zod schema per key before any write —
-- unvalidated arbitrary JSON must never be accepted at the app layer.
-- The jsonb_typeof check below is only a minimal structural guard
-- (rejects non-object JSON), not full schema validation.
-- ============================================================

create table site_content (
  key text primary key check (key in ('homepage', 'about', 'business_profile', 'site_settings', 'certificates')),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

comment on table site_content is
  'Flexible per-key page content (homepage, about, business_profile, site_settings, certificates). '
  'The exact shape of data for each key is a strict JSON Schema documented in '
  'supabase/site-content-json-schemas.md and must be validated by a matching Zod schema per key '
  'in every Server Action that writes to this table.';

create trigger trg_site_content_updated_at
  before update on site_content
  for each row execute function set_updated_at();

alter table site_content enable row level security;

-- Pre-seed the five known keys so the admin can only ever UPDATE an
-- existing row (no INSERT/DELETE policy is granted to any client role).
insert into site_content (key, data) values
  ('homepage', '{}'::jsonb),
  ('about', '{}'::jsonb),
  ('business_profile', '{}'::jsonb),
  ('site_settings', '{}'::jsonb),
  ('certificates', '{"items": []}'::jsonb)
on conflict (key) do nothing;
