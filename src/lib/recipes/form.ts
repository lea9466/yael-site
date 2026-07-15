import {
  createDefaultRecipeContent,
  createDefaultRecipeSeo,
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
    duration_minutes: recipe.duration_minutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    featured: recipe.featured,
    status: recipe.status,
    tag_ids: recipe.tags.map((tag) => tag.id),
    content: recipe.content ?? createDefaultRecipeContent(),
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
    duration_minutes: 30,
    servings: 4,
    difficulty: "easy",
    featured: false,
    status: "draft",
    tag_ids: [],
    content: createDefaultRecipeContent(),
    seo: createDefaultRecipeSeo(),
  };
}
