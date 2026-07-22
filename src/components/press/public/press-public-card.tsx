import Image from "next/image";
import Link from "next/link";

import { formatPressDate } from "@/lib/press/date";
import type { PressArticlePublicCard } from "@/lib/press/types";

type PressPublicCardProps = {
  article: PressArticlePublicCard;
  priority?: boolean;
};

export function PressPublicCard({
  article,
  priority = false,
}: PressPublicCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <Link
        href={`/press/${article.slug}`}
        className="public-focus-ring relative block aspect-[16/10] overflow-hidden bg-[var(--color-surface-soft)]"
      >
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.coverAlt ?? article.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[var(--transition-base)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[var(--color-light-sage-soft)] text-sm text-[var(--color-text-muted)]">
            {article.publication_name}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-caption font-medium tracking-wide text-[var(--color-secondary)]">
            {article.publication_name}
          </p>
          <p className="text-caption text-[var(--color-text-muted)]">
            {formatPressDate(article.published_at)}
          </p>
        </div>

        <h2 className="text-section-title text-xl sm:text-2xl">
          <Link
            href={`/press/${article.slug}`}
            className="public-focus-ring rounded-[var(--radius-sm)] hover:underline"
          >
            {article.title}
          </Link>
        </h2>

        {article.excerpt ? (
          <p className="line-clamp-3 flex-1 text-[var(--color-text-muted)]">
            {article.excerpt}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="pt-1">
          <Link
            href={`/press/${article.slug}`}
            className="public-focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-warm)] px-5 text-sm font-medium text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          >
            לקריאת הכתבה
          </Link>
        </div>
      </div>
    </article>
  );
}
