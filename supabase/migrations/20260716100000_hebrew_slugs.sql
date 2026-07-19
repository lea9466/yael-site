-- Allow Hebrew characters in content slugs (services, recipes, articles).
-- Categories and tags had no slug format check in the initial schema.

alter table services drop constraint if exists services_slug_check;
alter table recipes drop constraint if exists recipes_slug_check;
alter table articles drop constraint if exists articles_slug_check;

alter table services
  add constraint services_slug_check
  check (slug ~ '^[א-תa-z0-9]+(-[א-תa-z0-9]+)*$');

alter table recipes
  add constraint recipes_slug_check
  check (slug ~ '^[א-תa-z0-9]+(-[א-תa-z0-9]+)*$');

alter table articles
  add constraint articles_slug_check
  check (slug ~ '^[א-תa-z0-9]+(-[א-תa-z0-9]+)*$');
