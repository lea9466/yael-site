import type { CategoryType } from "@/lib/categories/constants";

export type DatabaseCategoryRow = {
  id: string;
  type: CategoryType;
  name: string;
  slug: string;
  image_media_id: string | null;
  created_at: string;
};
