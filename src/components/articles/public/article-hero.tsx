import Image from "next/image";

import { ArticleBadges } from "@/components/articles/public/article-badges";
import { ArticleMetadata } from "@/components/articles/public/article-metadata";
import { shortenForSeoDescription } from "@/lib/seo/resolve";
import type { ArticleDetail } from "@/lib/articles/types";
import { cn } from "@/lib/utils/cn";

type ArticleHeroProps = {
  article: ArticleDetail;
  className?: string;
};

export function ArticleHero({ article, className }: ArticleHeroProps) {
  const excerpt = article.body.trim()
    ? shortenForSeoDescription(article.body, 220)
    : null;

  return (
    <header className={cn("recipe-hero", className)}>
      <div className="recipe-hero__media">
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.coverAlt?.trim() || article.title}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 44vw"
            className="recipe-hero__image"
          />
        ) : (
          <div className="recipe-hero__media-fallback" aria-hidden="true">
            {article.title}
          </div>
        )}
      </div>

      <div className="recipe-hero__content">
        <ArticleBadges
          featured={article.featured}
          category={article.category}
          tags={article.tags}
        />

        <h1 className="recipe-hero__title">{article.title}</h1>

        {excerpt ? (
          <p className="recipe-hero__description">{excerpt}</p>
        ) : null}

        <ArticleMetadata
          readingTimeMinutes={article.reading_time_minutes}
          publishedAt={article.published_at}
          updatedAt={article.updated_at}
        />
      </div>
    </header>
  );
}
