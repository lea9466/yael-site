import { CategoryForm } from "@/components/categories/category-form";
import { createEmptyCategoryFormInput } from "@/lib/categories/form";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <CategoryForm
      mode="create"
      initialValues={createEmptyCategoryFormInput()}
    />
  );
}
