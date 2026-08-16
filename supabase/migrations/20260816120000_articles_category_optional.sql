-- Articles never needed a category concept (only recipes do). The column was
-- NOT NULL from the initial schema, which made every article creation fail
-- once the admin form stopped collecting a category. Make it nullable so the
-- app can stop sending category_id for articles entirely.
alter table articles alter column category_id drop not null;
