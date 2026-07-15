import { RecipeForm } from "@/components/recipes/recipe-form";
import { createEmptyRecipeFormInput } from "@/lib/recipes/form";
import { requireAdmin } from "@/lib/auth/session";
import {
  fetchRecipeCategories,
  fetchRecipeTags,
} from "@/lib/taxonomy/queries";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireAdmin();

  const [categories, availableTags] = await Promise.all([
    fetchRecipeCategories(),
    fetchRecipeTags(),
  ]);

  return (
    <RecipeForm
      mode="create"
      initialValues={createEmptyRecipeFormInput(categories[0]?.id)}
      categories={categories}
      availableTags={availableTags}
    />
  );
}
