import Image from "next/image";

import { AdminFeaturedBadge } from "@/components/admin/admin-status-badge";
import { ArticleBlockRenderer } from "@/lib/articles/render";
import {
  formatArticleDate,
  formatReadingTimeLabel,
} from "@/lib/articles/format";
import type { ArticleDetail } from "@/lib/articles/types";
import { escapeHtml } from "@/lib/services/sanitize";
import { TAG_PILL_CLASSES } from "@/lib/articles/constants";
import { cn } from "@/lib/utils/cn";

type ArticlePublicViewProps = {
  article: ArticleDetail;
  mode?: "public" | "preview";
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
}: ArticlePublicViewProps) {
  const isPreview = mode === "preview";
  const hasBlocks = article.content.blocks.length > 0;
  const showContent = isPreview || hasBlocks;
  const hasGalleryImages = article.galleryUrls.some((item) => item.url);
  const showGallery = isPreview || hasGalleryImages;
  const displayDate = article.published_at ?? article.updated_at;

  return (
    <article
      className={cn(
        "w-full space-y-10",
        isPreview
          ? "rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-4 sm:p-8"
          : "mx-auto max-w-4xl"
      )}
    >
      <header className={cn("space-y-5", isPreview && "mx-auto w-full max-w-[900px]")}>
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
        ) : isPreview ? (
          <EmptySectionNote>טרם נבחרה תמונת כיסוי</EmptySectionNote>
        ) : null}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-page-title">{escapeHtml(article.title)}</h1>
            {article.featured ? <AdminFeaturedBadge size="sm" /> : null}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
            {article.category ? (
              <span>קטגוריה: {escapeHtml(article.category.name)}</span>
            ) : isPreview ? (
              <span>ללא קטגוריה</span>
            ) : null}
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
          ) : isPreview ? (
            <p className="text-sm text-[var(--color-text-muted)]">אין תגיות</p>
          ) : null}
        </div>
      </header>

      {showContent ? (
        <section className={cn("space-y-6", isPreview && "mx-auto w-full max-w-[900px]")}>
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
