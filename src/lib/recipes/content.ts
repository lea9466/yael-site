import { createEmptyStoredSeo } from "@/lib/seo/resolve";
import type { RecipeContent } from "@/lib/recipes/types";

export function createDefaultRecipeContent(): RecipeContent {
  return {
    ingredients: [],
    steps: [],
    yael_tip: null,
    gallery: [],
  };
}

export function createDefaultRecipeSeo() {
  return createEmptyStoredSeo();
}

export function normalizeGalleryForSave(
  gallery: RecipeContent["gallery"]
): RecipeContent["gallery"] {
  return gallery
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({
      media_id: item.media_id,
      order: index,
    }));
}
