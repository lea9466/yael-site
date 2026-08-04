-- Allow recipes without a servings / yield value.

alter table recipes
  drop constraint if exists recipes_servings_check;

comment on column recipes.servings is
  'Optional short free-text yield, e.g. "24 עוגיות" or "4–6 מנות". Empty when omitted.';
