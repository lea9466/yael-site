import { RecipeCard } from "@/components/homepage/recipe-card";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { SectionCTA } from "@/components/homepage/section-cta";
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
          <header className="recipes-section__header">
            <h2 id="homepage-recipes-title" className="recipes-section__title">
              מהמתכונים האחרונים
            </h2>
            <p className="recipes-section__description">
              טעימים, בריאים וקלים להכנה
            </p>
          </header>
        </HomepageReveal>

        <ul
          className={cn(
            "recipes-section__grid",
            `recipes-section__grid--count-${recipes.length}`,
          )}
        >
          {recipes.map((recipe, index) => (
            <li key={recipe.id} className="recipes-section__item">
              <HomepageReveal delayMs={80 + index * 90}>
                <RecipeCard recipe={recipe} />
              </HomepageReveal>
            </li>
          ))}
        </ul>

        <HomepageReveal delayMs={160}>
          <div className="recipes-section__footer">
            <SectionCTA label="לכל המתכונים" href="/recipes" variant="primary" />
          </div>
        </HomepageReveal>
      </div>
    </section>
  );
}
