-- Explicit, least-privilege GRANT/REVOKE rules for anon and authenticated.
--
-- Depends on 20260714160000_initial_schema.sql and
-- 20260714160100_rls_policies.sql.
--
-- Why this exists in addition to RLS: RLS policies decide which ROWS a
-- role may see or touch, but they only apply to operations the role has
-- privilege to attempt in the first place. Supabase's ambient defaults
-- already grant anon/authenticated broad table privileges, so without
-- this migration RLS would be the *only* thing preventing e.g. an
-- accidental INSERT policy from being usable. This migration removes
-- that ambient baseline and re-grants only the exact privileges each
-- role needs, so a misconfigured policy fails closed rather than open.
--
-- service_role is a superuser-equivalent role in Supabase: it bypasses
-- both RLS and GRANT/REVOKE, and is not referenced anywhere below —
-- server-side code (Server Actions, Route Handlers) keeps working
-- unaffected.
--
-- Do not run this migration until it has been reviewed and approved.

-- ============================================================
-- Baseline reset
-- Strip whatever ambient default privileges anon/authenticated may
-- already hold on every table in the public schema, then grant back
-- only what each role actually needs, table by table, below.
-- ============================================================

revoke all on all tables in schema public from anon, authenticated;

-- ============================================================
-- Public read-only content
-- anon and authenticated (non-admin) may only ever SELECT these tables.
-- RLS still filters rows (e.g. only status = 'published'); this grant
-- only makes SELECT attemptable at all, never INSERT/UPDATE/DELETE.
-- ============================================================

grant select on
  public.services,
  public.recipes,
  public.articles,
  public.categories,
  public.tags,
  public.recipe_tags,
  public.article_tags,
  public.testimonials,
  public.media_library,
  public.site_content
to anon, authenticated;

-- ============================================================
-- Admin write path — content and taxonomy
-- Only authenticated gets write privileges here (anon never does).
-- RLS's is_admin() check is still required for every INSERT/UPDATE/
-- DELETE to actually succeed; this grant just removes the privilege-
-- level barrier for the authenticated role in general.
-- ============================================================

grant insert, update, delete on
  public.services,
  public.recipes,
  public.articles,
  public.categories,
  public.tags,
  public.recipe_tags,
  public.article_tags,
  public.testimonials,
  public.media_library
to authenticated;

-- site_content rows are fixed by migration (exactly 5: homepage, about,
-- business_profile, site_settings, certificates). The admin policy only
-- allows UPDATE, never INSERT/DELETE — so authenticated gets no insert
-- or delete grant here.
grant update on public.site_content to authenticated;

-- ============================================================
-- admin_users
-- No grant to anon at all — anon has zero privileges on this table.
-- authenticated gets SELECT and UPDATE only (matches the self-only RLS
-- policies), never INSERT (a client must never be able to create its
-- own admin row — that only happens server-side) and never DELETE.
-- ============================================================

grant select, update on public.admin_users to authenticated;

-- ============================================================
-- contact_messages
-- No grant to anon at all — public contact-form submissions no longer
-- go through a client-facing RLS policy; they are handled by a
-- protected server-side endpoint (validated input + rate limiting)
-- using the service_role client, which bypasses both RLS and these
-- grants entirely. authenticated (admin) may read, mark as read, and
-- delete spam, but gets no INSERT grant — writes only ever happen
-- server-side.
-- ============================================================

grant select, update, delete on public.contact_messages to authenticated;

-- ============================================================
-- Forward-looking note
-- This migration only re-grants privileges on tables that exist today.
-- Any new table added later must get its own explicit REVOKE/GRANT
-- statements in the migration that creates it — there is no blanket
-- "default privileges" rule configured here, by design, so every new
-- table is reviewed individually.
-- ============================================================
