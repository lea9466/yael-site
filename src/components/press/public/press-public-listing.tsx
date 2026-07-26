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
    <div className="mx-auto w-full max-w-[90rem] px-5 py-12 md:px-20 md:py-16">
      <header className="mb-10 max-w-2xl space-y-3">
        <p className="text-caption font-medium tracking-wide text-[var(--color-secondary)]">
          מהעיתונות
        </p>
        <h1 className="text-page-title">כתבות וראיונות</h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          כתבות, ראיונות וסיקור תקשורתי על אכילה מחוברת ועל הליווי התזונתי של
          יעל.
        </p>
      </header>

      {isEmpty ? (
        <PublicEmptyState
          icon={Newspaper}
          title="הכתבות יופיעו כאן בקרוב"
          description="בקרוב תוכלו לקרוא כאן כתבות וראיונות מהעיתונות."
        />
      ) : (
        <ul className="mx-auto grid list-none gap-x-8 gap-y-12 p-0 sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-2 xl:max-w-6xl">
          {articles.map((article) => (
            <li key={article.id} className="flex justify-center">
              <PressPublicCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
