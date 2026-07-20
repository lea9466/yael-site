import { normalizeRecipeSections } from "@/lib/recipes/content";
import { buildRecipeCanonicalUrl } from "@/lib/seo/resolve";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import { formatIngredientLine } from "@/lib/recipes/format-ingredient";
import { sanitizePlainText } from "@/lib/services/sanitize";
import type { RecipeDetail } from "@/lib/recipes/types";

type RecipeJsonLdProps = {
  recipe: RecipeDetail;
};

export function RecipeJsonLd({ recipe }: RecipeJsonLdProps) {
  const description = normalizeMultilineTextForSeo(
    sanitizePlainText(recipe.description)
  );
  const sections = normalizeRecipeSections(recipe.content);

  const ingredients = sections.flatMap((section) =>
    section.ingredients
      .map((ingredient) => formatIngredientLine(ingredient))
      .filter((line) => line.length > 0)
  );

  const instructions = sections.flatMap((section, sectionIndex) => {
    const sectionTitle = sanitizePlainText(section.title);
    const steps = section.steps
      .map((step) => sanitizePlainText(step.text))
      .filter((text) => text.length > 0);

    return steps.map((text, stepIndex) => {
      const howToStep: Record<string, unknown> = {
        "@type": "HowToStep",
        position: sectionIndex * 100 + stepIndex + 1,
        text,
      };

      if (sectionTitle) {
        howToStep.name = `${sectionTitle} — שלב ${stepIndex + 1}`;
      }

      return howToStep;
    });
  });

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    url: buildRecipeCanonicalUrl(recipe.slug, recipe.category?.slug),
    dateModified: recipe.updated_at,
  };

  if (description) {
    jsonLd.description = description;
  }

  if (recipe.coverUrl) {
    jsonLd.image = [recipe.coverUrl];
  }

  if (recipe.published_at) {
    jsonLd.datePublished = recipe.published_at;
  }

  if (recipe.category?.name) {
    jsonLd.recipeCategory = recipe.category.name;
  }

  if (recipe.servings.trim()) {
    jsonLd.recipeYield = recipe.servings.trim();
  }

  if (ingredients.length > 0) {
    jsonLd.recipeIngredient = ingredients;
  }

  if (instructions.length > 0) {
    jsonLd.recipeInstructions = instructions;
  }

  if (recipe.tags.length > 0) {
    jsonLd.keywords = recipe.tags.map((tag) => tag.name).join(", ");
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
