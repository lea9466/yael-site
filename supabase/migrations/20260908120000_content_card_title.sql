-- Optional per-item "card display name" for services, recipes and articles.
-- When set, it replaces the main title on the listing/homepage cards only —
-- the item's own page heading and SEO keep using `title`. Nullable, so every
-- existing row is unaffected and the fallback (card shows `title`) is implicit.
alter table services add column if not exists card_title text;
alter table recipes  add column if not exists card_title text;
alter table articles add column if not exists card_title text;

comment on column services.card_title is
  'Optional short name shown instead of title on public listing/homepage cards. NULL = use title.';
comment on column recipes.card_title is
  'Optional short name shown instead of title on public listing/homepage cards. NULL = use title.';
comment on column articles.card_title is
  'Optional short name shown instead of title on public listing/homepage cards. NULL = use title.';
