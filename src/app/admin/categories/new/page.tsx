import { CategoryForm } from "@/components/categories/category-form";
import { createEmptyCategoryFormInput } from "@/lib/categories/form";
import { requireAdmin } from "@/lib/auth/session";
import { CATEGORY_TYPES } from "@/lib/categories/constants";
import type { CategoryType } from "@/lib/categories/constants";

export const dynamic = "force-dynamic";

type NewCategoryPageProps = {
  searchParams: Promise<{ type?: string }>;
};

function parseDefaultType(value?: string): CategoryType {
  if (value && (CATEGORY_TYPES as readonly string[]).includes(value)) {
    return value as CategoryType;
  }

  return "recipe";
}

export default async function NewCategoryPage({
  searchParams,
}: NewCategoryPageProps) {
  await requireAdmin();

  const { type } = await searchParams;

  return (
    <CategoryForm
      mode="create"
      initialValues={createEmptyCategoryFormInput(parseDefaultType(type))}
    />
  );
}
