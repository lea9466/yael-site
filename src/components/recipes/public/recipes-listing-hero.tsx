import type { PublicRecipeCategory } from "@/lib/public/recipe-listing";
import { cn } from "@/lib/utils/cn";

type RecipesListingHeroProps = {
  category?: PublicRecipeCategory | null;
  className?: string;
};

export function RecipesListingHero({
  category,
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
    </header>
  );
}
