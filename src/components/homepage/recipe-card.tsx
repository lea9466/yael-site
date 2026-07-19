import Image from "next/image";
import Link from "next/link";

import { SectionCTA } from "@/components/homepage/section-cta";
import { MultilineText } from "@/components/ui/multiline-text";
import { formatDifficulty } from "@/lib/recipes/format";
import type { PublicRecipeSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RecipeCardProps = {
  recipe: PublicRecipeSummary;
  className?: string;
};

export function RecipeCard({ recipe, className }: RecipeCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <Link
        href={`/recipes/${recipe.slug}`}
        className="public-focus-ring relative block aspect-[16/10] overflow-hidden bg-[var(--color-fresh-green-soft)]"
      >
        {recipe.coverUrl ? (
          <Image
            src={recipe.coverUrl}
            alt={recipe.coverAlt ?? recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[var(--transition-slow)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--color-fresh-green)]">
            {recipe.title}
          </div>
        )}
        {recipe.featured ? (
          <span className="status-badge absolute start-3 top-3" data-size="sm" data-variant="featured">
            <span className="status-badge-label">מומלץ</span>
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {recipe.categoryName ? (
            <span className="inline-flex rounded-[var(--radius-full)] bg-[var(--color-fresh-green-soft)] px-3 py-1 text-xs font-medium text-[var(--color-fresh-green)] ring-1 ring-[var(--color-fresh-green)]/20">
              {recipe.categoryName}
            </span>
          ) : null}
          <span className="text-caption text-[var(--color-text-muted)]">
            {recipe.prep_duration}
          </span>
          <span className="text-caption text-[var(--color-text-muted)]">
            {formatDifficulty(recipe.difficulty)}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-card-title line-clamp-2">
            <Link
              href={`/recipes/${recipe.slug}`}
              className="public-focus-ring rounded-[var(--radius-sm)] transition-colors hover:text-[var(--color-fresh-green)]"
            >
              {recipe.title}
            </Link>
          </h3>
          <MultilineText as="p" className="text-muted line-clamp-3 text-sm">
            {recipe.description}
          </MultilineText>
        </div>
        <div className="mt-auto pt-1">
          <SectionCTA
            label="למתכון"
            href={`/recipes/${recipe.slug}`}
            variant="ghost"
            className="min-h-0 px-0 text-[var(--color-fresh-green)]"
          />
        </div>
      </div>
    </article>
  );
}
