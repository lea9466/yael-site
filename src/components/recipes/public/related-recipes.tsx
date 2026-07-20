import { RecipeCard } from "@/components/homepage/recipe-card";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import type { PublicRecipeSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RelatedRecipesProps = {
  recipes: PublicRecipeSummary[];
  className?: string;
};

export function RelatedRecipes({ recipes, className }: RelatedRecipesProps) {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-recipes-title"
      className={cn("related-recipes", className)}
    >
      <PublicSectionHeader
        className="related-recipes__header"
        titleId="related-recipes-title"
        title="מתכונים נוספים"
        actionLabel="לכל המתכונים"
        actionHref="/recipes"
      />

      <ul
        className={cn(
          "related-recipes__grid",
          `related-recipes__grid--count-${recipes.length}`
        )}
      >
        {recipes.map((recipe) => (
          <li key={recipe.id} className="related-recipes__item">
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>
    </section>
  );
}
