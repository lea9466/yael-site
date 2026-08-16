-- recipes.difficulty was NOT NULL from the initial schema but was never wired
-- into any app code (no form field, no validation, no insert/update value),
-- unlike prep_duration/servings which got a matching cleanup migration. This
-- made every recipe creation fail with a not-null constraint violation.
alter table recipes alter column difficulty drop not null;
