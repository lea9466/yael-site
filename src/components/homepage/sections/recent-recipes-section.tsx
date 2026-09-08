import { RecipeCard } from "@/components/homepage/recipe-card";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import type { PublicRecipeSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RecentRecipesSectionProps = {
  recipes: PublicRecipeSummary[];
};

export function RecentRecipesSection({ recipes }: RecentRecipesSectionProps) {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="homepage-recipes-title"
      className="recipes-section"
    >
      <div className="recipes-section__inner">
        <HomepageReveal>
          <PublicSectionHeader
            className="recipes-section__header"
            titleId="homepage-recipes-title"
            title="משהו טוב מתבשל פה"
            description="מתכונים מהלב לצלחת"
            actionLabel="לעוד מתכונים טובים"
            actionHref="/recipes"
          />
        </HomepageReveal>

        <ul
          className={cn(
            "recipes-section__grid",
            `recipes-section__grid--count-${recipes.length}`,
          )}
        >
          {recipes.map((recipe, index) => (
            <li key={recipe.id} className="recipes-section__item">
              <HomepageReveal delayMs={index * 250}>
                <RecipeCard recipe={recipe} />
              </HomepageReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
