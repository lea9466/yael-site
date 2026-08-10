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
  servings: string | null;
} {
  const servings = recipe.servings.trim();

  return {
    servings: servings.length > 0 ? servings : null,
  };
}
