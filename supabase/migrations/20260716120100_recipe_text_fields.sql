-- Convert recipe prep duration and servings from numeric to short text.
-- Depends on 20260714160000_initial_schema.sql.

alter table recipes
  drop constraint recipes_duration_minutes_check;

alter table recipes
  drop constraint recipes_servings_check;

alter table recipes
  alter column duration_minutes type text
  using duration_minutes::text || ' דקות';

alter table recipes
  rename column duration_minutes to prep_duration;

alter table recipes
  alter column servings type text
  using servings::text || ' מנות';

alter table recipes
  add constraint recipes_prep_duration_check
  check (length(trim(prep_duration)) > 0);

alter table recipes
  add constraint recipes_servings_check
  check (length(trim(servings)) > 0);

comment on column recipes.prep_duration is
  'Short free-text prep duration, e.g. "20 דקות" or "שעה התפחה + 30 דקות עבודה".';

comment on column recipes.servings is
  'Short free-text yield, e.g. "24 עוגיות" or "4–6 מנות".';
