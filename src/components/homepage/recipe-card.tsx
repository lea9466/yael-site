import Image from "next/image";
import Link from "next/link";
import { Clock, Gauge, UtensilsCrossed } from "lucide-react";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
import {
  getRecipeCardMeta,
  getRecipeCardTags,
} from "@/lib/homepage/recipe-card-display";
import type { PublicRecipeSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RecipeCardProps = {
  recipe: PublicRecipeSummary;
  className?: string;
};

export function RecipeCard({ recipe, className }: RecipeCardProps) {
  const href = `/recipes/${recipe.slug}`;
  const tags = getRecipeCardTags(recipe);
  const { prepDuration, servings, difficulty } = getRecipeCardMeta(recipe);

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
            {recipe.title}
          </Link>
        </h3>

        {recipe.description ? (
          <MultilineText as="p" className="recipe-card__description">
            {recipe.description}
          </MultilineText>
        ) : null}

        {(prepDuration || servings || difficulty) ? (
          <div className="recipe-card__meta">
            {prepDuration ? (
              <div className="recipe-card__meta-item">
                <Clock aria-hidden="true" className="recipe-card__meta-icon" />
                <span>{prepDuration}</span>
              </div>
            ) : null}
            {servings ? (
              <div className="recipe-card__meta-item">
                <UtensilsCrossed aria-hidden="true" className="recipe-card__meta-icon" />
                <span>{servings}</span>
              </div>
            ) : null}
            {difficulty ? (
              <div className="recipe-card__meta-item">
                <Gauge aria-hidden="true" className="recipe-card__meta-icon" />
                <span>{difficulty}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <Link href={href} className="recipe-card__cta public-focus-ring">
          למתכון
        </Link>
      </div>

      <Link
        href={href}
        className="recipe-card__media public-focus-ring"
        aria-label={recipe.title}
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
          <div className="recipe-card__media-fallback">{recipe.title}</div>
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
