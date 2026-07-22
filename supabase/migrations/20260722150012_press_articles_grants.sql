-- Explicit privileges for press_articles.
-- Required because 20260714160200_permissions.sql strips ambient grants
-- and only re-grants listed tables; new tables need their own GRANT.

grant select on public.press_articles to anon, authenticated;
grant insert, update, delete on public.press_articles to authenticated;
