import Image from "next/image";

import {
  formatArticleDateShort,
  formatReadingTimeLabel,
} from "@/lib/articles/format";
import type { ArticleDetail } from "@/lib/articles/types";
import { cn } from "@/lib/utils/cn";

type ArticleHeroProps = {
  article: ArticleDetail;
  className?: string;
};

export function ArticleHero({ article, className }: ArticleHeroProps) {
  const publishedLabel = article.published_at
    ? formatArticleDateShort(article.published_at)
    : null;
  const readingLabel =
    article.reading_time_minutes > 0
      ? formatReadingTimeLabel(article.reading_time_minutes)
      : null;

  return (
    <header className={cn("post-article__header", className)}>
      <h1 className="post-article__title">{article.title}</h1>

      {(publishedLabel || readingLabel) ? (
        <p className="post-article__meta">
          {publishedLabel ? <span>{publishedLabel}</span> : null}
          {publishedLabel && readingLabel ? (
            <span aria-hidden="true" className="post-article__meta-sep">
              ·
            </span>
          ) : null}
          {readingLabel ? <span>{readingLabel}</span> : null}
        </p>
      ) : null}

      {article.coverUrl ? (
        <div className="post-article__cover">
          <Image
            src={article.coverUrl}
            alt={article.coverAlt?.trim() || article.title}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 820px"
            className="post-article__cover-image"
          />
        </div>
      ) : null}
    </header>
  );
}
