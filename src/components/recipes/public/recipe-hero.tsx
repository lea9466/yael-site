import Image from "next/image";

import { RecipeActions } from "@/components/recipes/public/recipe-actions";
import { RecipeBadges } from "@/components/recipes/public/recipe-badges";
import { RecipeMetadata } from "@/components/recipes/public/recipe-metadata";
import { MultilineText } from "@/components/ui/multiline-text";
import { sanitizePlainText } from "@/lib/services/sanitize";
import type { RecipeDetail } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipeHeroProps = {
  recipe: RecipeDetail;
  showActions?: boolean;
  className?: string;
};

export function RecipeHero({
  recipe,
  showActions = true,
  className,
}: RecipeHeroProps) {
  const description = sanitizePlainText(recipe.description);

  return (
    <header className={cn("recipe-hero", className)}>
      <div className="recipe-hero__media">
        {recipe.coverUrl ? (
          <Image
            src={recipe.coverUrl}
            alt={recipe.coverAlt?.trim() || recipe.title}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 44vw"
            className="recipe-hero__image"
          />
        ) : (
          <div className="recipe-hero__media-fallback" aria-hidden="true">
            {recipe.title}
          </div>
        )}
      </div>

      <div className="recipe-hero__content">
        <RecipeBadges
          featured={recipe.featured}
          category={recipe.category}
          tags={recipe.tags}
        />

        <h1 className="recipe-hero__title">{recipe.title}</h1>

        {description ? (
          <MultilineText as="p" className="recipe-hero__description">
            {description}
          </MultilineText>
        ) : null}

        <RecipeMetadata
          prepDuration={recipe.prep_duration}
          servings={recipe.servings}
          difficulty={recipe.difficulty}
        />

        {showActions ? <RecipeActions title={recipe.title} /> : null}
      </div>
    </header>
  );
}
