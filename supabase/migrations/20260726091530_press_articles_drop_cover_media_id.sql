-- Remove unused cover image from press articles (public UI uses newspaper mark).

drop index if exists idx_press_articles_cover_media_id;

alter table press_articles
  drop column if exists cover_media_id;

comment on table press_articles is
  'Press articles and interviews. PDF files reference media_library ids only.';
