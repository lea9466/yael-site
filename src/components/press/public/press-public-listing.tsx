import { Newspaper } from "lucide-react";

import { PressPublicCard } from "@/components/press/public/press-public-card";
import { PublicEmptyState } from "@/components/public/states/public-empty-state";
import type { PressArticlePublicCard as PressCard } from "@/lib/press/types";

type PressPublicListingProps = {
  articles: PressCard[];
};

export function PressPublicListing({ articles }: PressPublicListingProps) {
  const isEmpty = articles.length === 0;

  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 pb-16 pt-10 md:px-20 md:pb-24 md:pt-14">
      <header className="relative mb-12 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-light-sage-soft)] px-6 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-10 -top-10 size-40 rounded-full bg-[var(--color-warm-gold-soft)] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -end-8 size-48 rounded-full bg-[var(--color-coral-soft)] blur-2xl"
        />
        <div className="relative z-[var(--z-page)] max-w-2xl space-y-4">
          <p className="text-caption font-medium tracking-wide text-[var(--color-secondary)]">
            מהעיתונות
          </p>
          <h1 className="text-page-title">כתבות וראיונות</h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            כתבות, ראיונות וסיקור תקשורתי על הגישה לאכילה מחוברת ועל הליווי
            התזונתי של יעל.
          </p>
        </div>
      </header>

      {isEmpty ? (
        <PublicEmptyState
          icon={Newspaper}
          title="הכתבות יופיעו כאן בקרוב"
          description="בקרוב תוכלו לקרוא כאן כתבות וראיונות מהעיתונות."
        />
      ) : (
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <li key={article.id}>
              <PressPublicCard article={article} priority={index === 0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
