import { RecipeCard } from "@/components/homepage/recipe-card";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { Container } from "@/components/public/layout/container";
import { Section } from "@/components/public/layout/section";
import type { PublicRecipeSummary } from "@/lib/public/types";

type RecentRecipesSectionProps = {
  recipes: PublicRecipeSummary[];
};

export function RecentRecipesSection({ recipes }: RecentRecipesSectionProps) {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <Section ariaLabelledBy="homepage-recipes-title">
      <Container className="space-y-10">
        <PublicSectionHeader
          eyebrow="מתכונים"
          title="מתכונים אחרונים"
          description="אוכל טעים, צבעוני ומזין — מתכונים שמתאימים לחיים האמיתיים."
          actionLabel="כל המתכונים"
          actionHref="/recipes"
          titleId="homepage-recipes-title"
        />
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
