import Link from "next/link";

import { formatPressDate } from "@/lib/press/date";
import type { PressArticlePublicCard } from "@/lib/press/types";

import "./press-card.css";

type PressPublicCardProps = {
  article: PressArticlePublicCard;
  accentIndex?: number;
};

export function PressPublicCard({
  article,
  accentIndex = 0,
}: PressPublicCardProps) {
  const href = `/press/${article.slug}`;
  const accent = (accentIndex % 4) + 1;

  return (
    <article className="press-card" data-accent={accent}>
      <Link href={href} className="press-card__link public-focus-ring">
        <div className="press-card__paper" aria-hidden="true">
          <div className="press-card__leaf press-card__leaf--left">
            <div className="press-card__leaf-inner">
              <span className="press-card__mast-bar" />
              <span className="press-card__ghost-line press-card__ghost-line--wide" />
              <span className="press-card__ghost-line" />
              <span className="press-card__ghost-line press-card__ghost-line--mid" />
              <span className="press-card__ghost-line" />
              <span className="press-card__ghost-line press-card__ghost-line--short" />
              <span className="press-card__ghost-block" />
              <span className="press-card__ghost-line" />
              <span className="press-card__ghost-line press-card__ghost-line--mid" />
            </div>
          </div>
          <div className="press-card__leaf press-card__leaf--right">
            <div className="press-card__leaf-inner">
              <span className="press-card__mast-bar press-card__mast-bar--soft" />
              <span className="press-card__ghost-line" />
              <span className="press-card__ghost-line press-card__ghost-line--mid" />
              <span className="press-card__ghost-block press-card__ghost-block--alt" />
              <span className="press-card__ghost-line" />
              <span className="press-card__ghost-line press-card__ghost-line--short" />
              <span className="press-card__ghost-line press-card__ghost-line--wide" />
              <span className="press-card__ghost-line" />
              <span className="press-card__ghost-line press-card__ghost-line--mid" />
            </div>
          </div>
        </div>

        <div className="press-card__content">
          <div className="press-card__meta">
            <span className="press-card__dot" aria-hidden="true" />
            <p className="press-card__publication">{article.publication_name}</p>
          </div>
          <time className="press-card__date" dateTime={article.published_at}>
            {formatPressDate(article.published_at)}
          </time>
          <h2 className="press-card__title">{article.title}</h2>
          {article.excerpt ? (
            <p className="press-card__excerpt">{article.excerpt}</p>
          ) : null}
          <span className="press-card__cta">לקריאת הכתבה</span>
        </div>
      </Link>
    </article>
  );
}
