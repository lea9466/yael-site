import { Newspaper } from "lucide-react";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
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
          מן התקשורת
        </p>
        <h1 className="text-page-title">מאחורי העיתון</h1>
        <p className="text-lg text-[var(--color-text-muted)]">כתבות וראיונות</p>
      </header>

      {isEmpty ? (
        <PublicEmptyState
          icon={Newspaper}
          title="הכתבות יופיעו כאן בקרוב"
          description="בקרוב תוכלו לקרוא כאן כתבות וראיונות מהעיתונות."
        />
      ) : (
        <ul className="grid list-none justify-items-stretch gap-x-7 gap-y-10 p-0 text-right sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article, index) => (
            <li
              key={article.id}
              className="flex w-full justify-center sm:block"
            >
              <HomepageReveal delayMs={(index % 3) * 250}>
                <PressPublicCard article={article} accentIndex={index} />
              </HomepageReveal>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
