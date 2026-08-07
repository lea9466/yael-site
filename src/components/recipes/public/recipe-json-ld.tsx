import { formatIngredientLine } from "@/lib/recipes/format-ingredient";
import { normalizeRecipeSections } from "@/lib/recipes/content";
import type { RecipeDetail } from "@/lib/recipes/types";
import { parseDurationToIso8601 } from "@/lib/seo/duration";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildRecipeCanonicalUrl } from "@/lib/seo/resolve";
import { SITE_ORIGIN } from "@/lib/site/constants";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import { sanitizePlainText } from "@/lib/services/sanitize";

type RecipeJsonLdProps = {
  recipe: RecipeDetail;
  authorName?: string;
};

export function RecipeJsonLd({
  recipe,
  authorName = "יעל קנייבסקי",
}: RecipeJsonLdProps) {
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

  const prepTime = parseDurationToIso8601(recipe.prep_duration);
  const author = {
    "@type": "Person",
    "@id": `${SITE_ORIGIN}/#person`,
    name: authorName,
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    url: buildRecipeCanonicalUrl(recipe.slug, recipe.category?.slug),
    dateModified: recipe.updated_at,
    author,
    recipeCuisine: "ישראלית",
    inLanguage: "he",
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

  if (prepTime) {
    jsonLd.prepTime = prepTime;
    jsonLd.totalTime = prepTime;
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

  return <JsonLd data={jsonLd} />;
}
