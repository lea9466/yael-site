import { notFound } from "next/navigation";

import { RecipeForm } from "@/components/recipes/recipe-form";
import { recipeDetailToFormInput } from "@/lib/recipes/form";
import { fetchRecipeById } from "@/lib/recipes/queries";
import { requireAdmin } from "@/lib/auth/session";
import {
  fetchRecipeCategories,
  fetchRecipeTags,
} from "@/lib/taxonomy/queries";

export const dynamic = "force-dynamic";

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  await requireAdmin();

  const { id } = await params;
  const [recipe, categories, availableTags] = await Promise.all([
    fetchRecipeById(id),
    fetchRecipeCategories(),
    fetchRecipeTags(),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <RecipeForm
      key={`${recipe.id}-${recipe.updated_at}`}
      mode="edit"
      initialRecipe={recipe}
      initialValues={recipeDetailToFormInput(recipe)}
      categories={categories}
      availableTags={availableTags}
    />
  );
}
