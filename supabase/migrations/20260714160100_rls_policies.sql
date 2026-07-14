-- RLS policies for yael-site. Depends on 20260714160000_initial_schema.sql,
-- which enabled RLS on every table but created no policies — until a
-- policy is added, RLS-enabled tables deny all access by default.
--
-- Do not run this migration until it has been reviewed and approved.

-- ============================================================
-- is_admin(): the single source of truth for "is this the administrator"
-- ============================================================
--
-- SECURITY DEFINER so this function can read admin_users regardless of
-- the calling role's own RLS visibility into that table — this avoids
-- recursive RLS evaluation (admin_users' own policies check auth.uid()
-- directly, not is_admin(), so there is no cycle).
--
-- search_path is set to '' (empty) and every referenced object is fully
-- qualified, so this SECURITY DEFINER function can't be tricked into
-- resolving an unqualified name against an attacker-controlled schema.

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;

-- ============================================================
-- 1. admin_users
-- Self-only. No INSERT/DELETE policy for any client role — the single
-- admin row is provisioned exclusively via service-role/server code.
-- ============================================================

create policy admin_users_select_self on admin_users
  for select
  to authenticated
  using (id = auth.uid());

create policy admin_users_update_self on admin_users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- 2. site_content
-- Public read (all five rows power public pages). Admin can UPDATE
-- only — no INSERT/DELETE, since the five keys are fixed by migration.
-- ============================================================

create policy site_content_public_select on site_content
  for select
  to anon, authenticated
  using (true);

create policy site_content_admin_update on site_content
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 3. services
-- ============================================================

create policy services_public_select on services
  for select
  to anon, authenticated
  using (status = 'published');

create policy services_admin_all on services
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 4. recipes
-- ============================================================

create policy recipes_public_select on recipes
  for select
  to anon, authenticated
  using (status = 'published');

create policy recipes_admin_all on recipes
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 5. articles
-- ============================================================

create policy articles_public_select on articles
  for select
  to anon, authenticated
  using (status = 'published');

create policy articles_admin_all on articles
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 6. categories
-- No draft state for taxonomy — always publicly readable.
-- ============================================================

create policy categories_public_select on categories
  for select
  to anon, authenticated
  using (true);

create policy categories_admin_all on categories
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 7. tags
-- ============================================================

create policy tags_public_select on tags
  for select
  to anon, authenticated
  using (true);

create policy tags_admin_all on tags
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 8. recipe_tags
-- ============================================================

-- Public/anon may only see a recipe's tags once that recipe itself is
-- published — otherwise the tag relation would leak the existence (and
-- tag associations) of draft/archived recipes. Admins see everything
-- via recipe_tags_admin_all below.
create policy recipe_tags_public_select on recipe_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.recipes r
      where r.id = recipe_tags.recipe_id
        and r.status = 'published'
    )
  );

create policy recipe_tags_admin_all on recipe_tags
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 9. article_tags
-- ============================================================

-- Same rationale as recipe_tags_public_select: only expose the tag
-- relation once the related article is published.
create policy article_tags_public_select on article_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.articles a
      where a.id = article_tags.article_id
        and a.status = 'published'
    )
  );

create policy article_tags_admin_all on article_tags
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 10. testimonials
-- ============================================================

create policy testimonials_public_select on testimonials
  for select
  to anon, authenticated
  using (is_published = true);

create policy testimonials_admin_all on testimonials
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- 11. contact_messages
-- No client-facing INSERT policy: anon and authenticated have no way to
-- write to this table via RLS. Contact form submissions are handled by
-- a protected server-side endpoint (validated input + rate limiting)
-- using the service_role client, which bypasses RLS entirely and is not
-- affected by the absence of a policy here. Only the admin may
-- read/manage existing messages.
-- ============================================================

create policy contact_messages_admin_select on contact_messages
  for select
  to authenticated
  using (is_admin());

create policy contact_messages_admin_update on contact_messages
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy contact_messages_admin_delete on contact_messages
  for delete
  to authenticated
  using (is_admin());

-- ============================================================
-- 12. media_library
-- Public read (metadata isn't sensitive and is needed to render public
-- images/alt text). Admin manages inserts/updates. Deletes additionally
-- rely on ON DELETE RESTRICT for the FK-protected columns, and must go
-- through the protected server-side action described on the table
-- comment for JSONB-embedded references.
-- ============================================================

create policy media_library_public_select on media_library
  for select
  to anon, authenticated
  using (true);

create policy media_library_admin_insert on media_library
  for insert
  to authenticated
  with check (is_admin());

create policy media_library_admin_update on media_library
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy media_library_admin_delete on media_library
  for delete
  to authenticated
  using (is_admin());
