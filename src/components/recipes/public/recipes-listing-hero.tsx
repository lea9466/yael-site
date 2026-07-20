import type { PublicRecipeCategory } from "@/lib/public/recipe-listing";
import { formatRecipeListingCount } from "@/lib/public/recipe-listing-ui";
import { cn } from "@/lib/utils/cn";

type RecipesListingHeroProps = {
  category?: PublicRecipeCategory | null;
  totalCount: number;
  className?: string;
};

export function RecipesListingHero({
  category,
  totalCount,
  className,
}: RecipesListingHeroProps) {
  const title = category ? category.name : "מתכונים";
  const description = category ? null : "טעימים, בריאים וקלים להכנה";

  return (
    <header className={cn("recipes-listing-hero", className)}>
      <h1 id="recipes-page-title" className="recipes-listing-hero__title">
        {title}
      </h1>

      {description ? (
        <p className="recipes-listing-hero__description">{description}</p>
      ) : null}

      <p className="recipes-listing-hero__count">
        {formatRecipeListingCount(totalCount)}
      </p>
    </header>
  );
}
