import type { CategoryInput } from "@/lib/validations/category";

export function createEmptyCategoryFormInput(): CategoryInput {
  return {
    name: "",
    slug: "",
    type: "recipe",
    image_media_id: null,
  };
}

export function categoryToFormInput(category: {
  name: string;
  slug: string;
  type: string;
  image_media_id: string | null;
}): CategoryInput {
  return {
    name: category.name,
    slug: category.slug,
    type: "recipe",
    image_media_id: category.image_media_id,
  };
}
