import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/categories/category-form";
import { categoryToFormInput } from "@/lib/categories/form";
import { fetchCategoryById } from "@/lib/categories/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  await requireAdmin();

  const { id } = await params;
  const category = await fetchCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <CategoryForm
      key={category.id}
      mode="edit"
      category={category}
      initialValues={categoryToFormInput(category)}
    />
  );
}
