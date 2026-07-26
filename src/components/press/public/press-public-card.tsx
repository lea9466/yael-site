import Link from "next/link";

import { formatPressDate } from "@/lib/press/date";
import type { PressArticlePublicCard } from "@/lib/press/types";

import "./press-card.css";

type PressPublicCardProps = {
  article: PressArticlePublicCard;
};

export function PressPublicCard({ article }: PressPublicCardProps) {
  const href = `/press/${article.slug}`;

  return (
    <article className="press-card">
      <Link href={href} className="press-card__link public-focus-ring">
        <div className="press-card__stack" aria-hidden="true">
          <div className="press-card__sheet press-card__sheet--shadow" />
          <div className="press-card__sheet press-card__sheet--back" />
        </div>

        <div className="press-card__sheet press-card__sheet--front">
          <div className="press-card__edge" aria-hidden="true" />

          <header className="press-card__masthead">
            <p className="press-card__kicker">מהעיתונות</p>
            <p className="press-card__publication">{article.publication_name}</p>
            <div className="press-card__meta-row">
              <span className="press-card__ornament" aria-hidden="true" />
              <time
                className="press-card__date"
                dateTime={article.published_at}
              >
                {formatPressDate(article.published_at)}
              </time>
              <span className="press-card__ornament" aria-hidden="true" />
            </div>
            <span className="press-card__rule press-card__rule--double" aria-hidden="true" />
          </header>

          <div className="press-card__body">
            <h2 className="press-card__title">{article.title}</h2>

            <div className="press-card__feature" aria-hidden="true">
              <span className="press-card__feature-glow" />
              <span className="press-card__feature-lines">
                <span />
                <span />
                <span />
              </span>
            </div>

            {article.excerpt ? (
              <p className="press-card__excerpt">{article.excerpt}</p>
            ) : null}

            <div className="press-card__columns" aria-hidden="true">
              <div className="press-card__col">
                <span className="press-card__line press-card__line--head" />
                <span className="press-card__line" />
                <span className="press-card__line" />
                <span className="press-card__line press-card__line--mid" />
                <span className="press-card__line" />
                <span className="press-card__line press-card__line--short" />
                <span className="press-card__line" />
                <span className="press-card__line press-card__line--mid" />
              </div>
              <div className="press-card__col">
                <span className="press-card__line" />
                <span className="press-card__line press-card__line--mid" />
                <span className="press-card__line" />
                <span className="press-card__line" />
                <span className="press-card__line press-card__line--short" />
                <span className="press-card__line press-card__line--head" />
                <span className="press-card__line" />
                <span className="press-card__line press-card__line--mid" />
              </div>
            </div>
          </div>

          <footer className="press-card__footer">
            <span className="press-card__folio" aria-hidden="true">
              עמוד א׳
            </span>
            <span className="press-card__cta">לקריאת הכתבה</span>
          </footer>

          <span className="press-card__fold" aria-hidden="true" />
        </div>
      </Link>
    </article>
  );
}
