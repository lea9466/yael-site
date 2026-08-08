import type { PublicRecipeCategory } from "@/lib/public/recipe-listing";
import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-page-copy";
import { cn } from "@/lib/utils/cn";

type RecipesListingHeroProps = {
  category?: PublicRecipeCategory | null;
  className?: string;
};

export function RecipesListingHero({
  category,
  className,
}: RecipesListingHeroProps) {
  const title = category ? category.name : PUBLIC_PAGE_SEO.recipes.heading;
  const description = category ? null : PUBLIC_PAGE_SEO.recipes.intro;

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
