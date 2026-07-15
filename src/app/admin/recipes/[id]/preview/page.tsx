import { notFound } from "next/navigation";

import { RecipePreviewBanner } from "@/components/recipes/recipe-preview-banner";
import { RecipePublicView } from "@/components/recipes/recipe-public-view";
import { STATUS_LABELS } from "@/lib/recipes/constants";
import { fetchRecipeById } from "@/lib/recipes/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type RecipePreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipePreviewPage({
  params,
}: RecipePreviewPageProps) {
  await requireAdmin();

  const { id } = await params;
  const recipe = await fetchRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-1 sm:px-0">
      <RecipePreviewBanner
        recipeId={recipe.id}
        status={STATUS_LABELS[recipe.status]}
      />
      <RecipePublicView recipe={recipe} />
    </div>
  );
}
