import { notFound } from "next/navigation";

import { PreviewShell } from "@/components/admin/preview-shell";
import { RecipePublicView } from "@/components/recipes/recipe-public-view";
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
    <PreviewShell
      status={recipe.status}
      editHref={`/admin/recipes/${recipe.id}`}
    >
      <RecipePublicView recipe={recipe} mode="preview" />
    </PreviewShell>
  );
}
