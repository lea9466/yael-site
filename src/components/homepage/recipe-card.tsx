import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
import {
  getRecipeCardMeta,
  getRecipeCardTags,
} from "@/lib/homepage/recipe-card-display";
import { buildRecipePath } from "@/lib/public/recipe-paths";
import type { PublicRecipeSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RecipeCardProps = {
  recipe: PublicRecipeSummary;
  className?: string;
};

export function RecipeCard({ recipe, className }: RecipeCardProps) {
  const href = buildRecipePath(recipe.categorySlug, recipe.slug);
  const tags = getRecipeCardTags(recipe);
  const { servings } = getRecipeCardMeta(recipe);
  const cardTitle = recipe.card_title?.trim() || recipe.title;

  return (
    <article className={cn("recipe-card group", className)}>
      <div className="recipe-card__body">
        {tags.length > 0 ? (
          <ul className="recipe-card__tags" aria-label="קטגוריה">
            {tags.map((tag) => (
              <li key={`${recipe.id}-${tag.label}`}>
                <span className="recipe-card__tag">{tag.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <h3 className="recipe-card__title">
          <Link href={href} className="public-focus-ring rounded-[var(--radius-sm)]">
            {cardTitle}
          </Link>
        </h3>

        {recipe.description ? (
          <MultilineText as="p" className="recipe-card__description">
            {recipe.description}
          </MultilineText>
        ) : null}

        {servings ? (
          <div className="recipe-card__meta">
            <div className="recipe-card__meta-item">
              <UtensilsCrossed aria-hidden="true" className="recipe-card__meta-icon" />
              <span>{servings}</span>
            </div>
          </div>
        ) : null}

        <Link href={href} className="recipe-card__cta public-focus-ring">
          למתכון
        </Link>
      </div>

      <Link
        href={href}
        className="recipe-card__media public-focus-ring"
        aria-label={cardTitle}
      >
        {recipe.coverUrl ? (
          <Image
            src={recipe.coverUrl}
            alt={recipe.coverAlt ?? recipe.title}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
            className="recipe-card__image"
          />
        ) : (
          <div className="recipe-card__media-fallback">{cardTitle}</div>
        )}

        {recipe.featured ? (
          <PublicHighlightPill
            label="מומלץ"
            variant="coral"
            floating={false}
            className="recipe-card__featured-badge"
          />
        ) : null}
      </Link>
    </article>
  );
}
