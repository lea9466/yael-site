-- ============================================================================
-- One-time fix: services whose slug is a leftover from a different example
-- title. The slug is the public URL and is frozen after the first save, so
-- these have to be corrected directly in the database.
--
-- Run in: Supabase dashboard -> SQL Editor.
-- ============================================================================


-- 1. The fix — two services only.
begin;

update services set slug = 'וובינר'     where slug = 'מאמנת-אישית';
update services set slug = 'מדריך-מתנה' where slug = 'מאמנת-אישית-copy';

commit;


-- 2. Verify.
select title, slug, status from services order by title;


-- ----------------------------------------------------------------------------
-- Optional: if "ספר מתכונים" still 404s, it's probably a draft/archived
-- service with its own leftover slug. Find it:
--
--   select id, title, slug, status from services
--   where status <> 'published' order by title;
--
-- then, once you see its current slug:
--
--   update services set slug = 'ספר-מתכונים' where slug = '<current slug>';
-- ----------------------------------------------------------------------------
