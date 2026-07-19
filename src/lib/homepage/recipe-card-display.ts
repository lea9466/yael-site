import { formatDifficulty } from "@/lib/recipes/format";
import type { PublicRecipeSummary } from "@/lib/public/types";

export type RecipeCardTag = {
  label: string;
};

export function getRecipeCardTags(recipe: PublicRecipeSummary): RecipeCardTag[] {
  if (!recipe.categoryName) {
    return [];
  }

  return [{ label: recipe.categoryName }];
}

export function getRecipeCardMeta(recipe: PublicRecipeSummary): {
  prepDuration: string | null;
  servings: string | null;
  difficulty: string | null;
} {
  const prepDuration = recipe.prep_duration.trim();
  const servings = recipe.servings.trim();

  return {
    prepDuration: prepDuration.length > 0 ? prepDuration : null,
    servings: servings.length > 0 ? servings : null,
    difficulty: formatDifficulty(recipe.difficulty),
  };
}
