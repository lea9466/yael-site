import {
  createDefaultRecipeContent,
  createDefaultRecipeSeo,
  normalizeRecipeSections,
} from "@/lib/recipes/content";
import type { RecipeDetail } from "@/lib/recipes/types";
import type { RecipeDraftInput } from "@/lib/validations/recipe";

export function recipeDetailToFormInput(recipe: RecipeDetail): RecipeDraftInput {
  return {
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    cover_media_id: recipe.cover_media_id,
    seo_og_media_id: recipe.seo_og_media_id,
    category_id: recipe.category_id,
    prep_duration: recipe.prep_duration,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    featured: recipe.featured,
    status: recipe.status,
    tag_ids: recipe.tags.map((tag) => tag.id),
    content: {
      recipe_sections: normalizeRecipeSections(
        recipe.content ?? createDefaultRecipeContent()
      ),
      yael_tip: recipe.content?.yael_tip ?? null,
      gallery: recipe.content?.gallery ?? [],
    },
    seo: recipe.seo ?? createDefaultRecipeSeo(),
  };
}

export function createEmptyRecipeFormInput(
  categoryId?: string
): RecipeDraftInput {
  return {
    title: "",
    slug: "",
    description: "",
    cover_media_id: null,
    seo_og_media_id: null,
    category_id: categoryId ?? "",
    prep_duration: "30 דקות",
    servings: "",
    difficulty: "easy",
    featured: false,
    status: "draft",
    tag_ids: [],
    content: {
      recipe_sections: [
        {
          title: "",
          ingredients: [],
          steps: [],
        },
      ],
      yael_tip: null,
      gallery: [],
    },
    seo: createDefaultRecipeSeo(),
  };
}
