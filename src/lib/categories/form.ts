import type { CategoryType } from "@/lib/categories/constants";
import type { CategoryInput } from "@/lib/validations/category";

export function createEmptyCategoryFormInput(
  type: CategoryType = "recipe"
): CategoryInput {
  return {
    name: "",
    slug: "",
    type,
    image_media_id: null,
  };
}

export function categoryToFormInput(category: {
  name: string;
  slug: string;
  type: CategoryType;
  image_media_id: string | null;
}): CategoryInput {
  return {
    name: category.name,
    slug: category.slug,
    type: category.type,
    image_media_id: category.image_media_id,
  };
}
