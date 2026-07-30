import Image from "next/image";

import { AdminFeaturedBadge } from "@/components/admin/admin-status-badge";
import { ArticleBreadcrumbs } from "@/components/articles/public/article-breadcrumbs";
import { ArticleHero } from "@/components/articles/public/article-hero";
import { TAG_PILL_CLASSES } from "@/lib/articles/constants";
import {
  formatArticleDate,
  formatReadingTimeLabel,
} from "@/lib/articles/format";
import { ArticleBlockRenderer } from "@/lib/articles/render";
import type { ArticleDetail } from "@/lib/articles/types";
import { escapeHtml } from "@/lib/services/sanitize";
import { cn } from "@/lib/utils/cn";

type ArticlePublicViewProps = {
  article: ArticleDetail;
  mode?: "public" | "preview";
  showBreadcrumbs?: boolean;
};

function EmptySectionNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/60 px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

export function ArticlePublicView({
  article,
  mode = "public",
  showBreadcrumbs = mode === "public",
}: ArticlePublicViewProps) {
  const isPreview = mode === "preview";
  const hasBlocks = article.content.blocks.length > 0;
  const showContent = isPreview || hasBlocks;
  const hasGalleryImages = article.galleryUrls.some((item) => item.url);
  const showGallery = isPreview || hasGalleryImages;
  const displayDate = article.published_at ?? article.updated_at;

  if (!isPreview) {
    return (
      <article className="post-article">
        {showBreadcrumbs ? (
          <ArticleBreadcrumbs
            postTitle={article.title}
            category={article.category}
          />
        ) : null}

        <ArticleHero article={article} />

        {showContent && hasBlocks ? (
          <div className="post-article__flourish" aria-hidden="true">
            <span className="post-article__flourish-line" />
            <span className="post-article__flourish-leaf post-article__flourish-leaf--olive" />
            <span className="post-article__flourish-dot" />
            <span className="post-article__flourish-leaf post-article__flourish-leaf--coral" />
            <span className="post-article__flourish-line" />
          </div>
        ) : null}

        {showContent && hasBlocks ? (
          <section className="post-article__body" dir="rtl">
            {article.content.blocks.map((block, index) => {
              const media =
                block.type === "image"
                  ? article.blockMediaUrls.get(block.media_id)
                  : undefined;

              return (
                <ArticleBlockRenderer
                  key={`${index}-${block.type}`}
                  block={block}
                  imageUrl={media?.url}
                  imageAlt={media?.alt}
                />
              );
            })}
          </section>
        ) : null}

        {article.tags.length > 0 ? (
          <ul className="post-article__tags" aria-label="תגיות">
            {article.tags.map((tag, index) => (
              <li key={tag.id}>
                <span
                  className={cn(
                    "post-article__tag",
                    TAG_PILL_CLASSES[index % TAG_PILL_CLASSES.length]
                  )}
                >
                  {tag.name}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {showGallery && hasGalleryImages ? (
          <section className="post-article__gallery" aria-label="גלריה">
            <div className="post-article__gallery-grid">
              {article.galleryUrls.map((item) =>
                item.url ? (
                  <div key={item.media_id} className="post-article__gallery-item">
                    <Image
                      src={item.url}
                      alt={item.alt ?? article.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null
              )}
            </div>
          </section>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "w-full space-y-10",
        "rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-4 sm:p-8"
      )}
    >
      <header className="mx-auto w-full max-w-[900px] space-y-5">
        {article.coverUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]">
            <Image
              src={article.coverUrl}
              alt={article.coverAlt ?? article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        ) : (
          <EmptySectionNote>טרם נבחרה תמונת כיסוי</EmptySectionNote>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-page-title">{escapeHtml(article.title)}</h1>
            {article.featured ? <AdminFeaturedBadge size="sm" /> : null}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
            {article.category ? (
              <span>קטגוריה: {escapeHtml(article.category.name)}</span>
            ) : (
              <span>ללא קטגוריה</span>
            )}
            <span>{formatReadingTimeLabel(article.reading_time_minutes)}</span>
            <span>
              {article.published_at ? "פורסם" : "עודכן"}:{" "}
              {formatArticleDate(displayDate)}
            </span>
          </div>

          {article.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={tag.id}
                  className={cn(
                    "inline-flex items-center rounded-[var(--radius-full)] px-3 py-1.5 text-caption font-medium ring-1",
                    TAG_PILL_CLASSES[index % TAG_PILL_CLASSES.length]
                  )}
                >
                  {escapeHtml(tag.name)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">אין תגיות</p>
          )}
        </div>
      </header>

      {showContent ? (
        <section className="mx-auto w-full max-w-[900px] space-y-6">
          {hasBlocks ? (
            article.content.blocks.map((block, index) => {
              const media =
                block.type === "image"
                  ? article.blockMediaUrls.get(block.media_id)
                  : undefined;

              return (
                <ArticleBlockRenderer
                  key={`${index}-${block.type}`}
                  block={block}
                  imageUrl={media?.url}
                  imageAlt={media?.alt}
                />
              );
            })
          ) : (
            <EmptySectionNote>טרם נוסף תוכן לפוסט</EmptySectionNote>
          )}
        </section>
      ) : null}

      {showGallery ? (
        <section className="space-y-4">
          <h2 className="text-section-title">גלריה</h2>
          {hasGalleryImages ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {article.galleryUrls.map((item) =>
                item.url ? (
                  <div
                    key={item.media_id}
                    className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]"
                  >
                    <Image
                      src={item.url}
                      alt={item.alt ?? article.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <EmptySectionNote>טרם נוספו תמונות לגלריה</EmptySectionNote>
          )}
        </section>
      ) : null}
    </article>
  );
}
