import type { CategoryType } from "@/lib/categories/constants";
import type { TagType } from "@/lib/tags/constants";

export type DatabaseCategoryRow = {
  id: string;
  type: CategoryType;
  name: string;
  slug: string;
  image_media_id: string | null;
  created_at: string;
};

export type DatabaseTagRow = {
  id: string;
  type: TagType;
  name: string;
  slug: string;
  created_at: string;
};
