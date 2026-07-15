import type { DatabaseCategoryRow } from "@/types/database";
import type { ListCategoriesQuery } from "@/lib/validations/category";

export type CategoryRecord = DatabaseCategoryRow;

export type CategoryListItem = CategoryRecord & {
  usageCount: number;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type CategoriesListData = {
  items: CategoryListItem[];
  query: ListCategoriesQuery;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
};

export type CategoryActionResult =
  | { success: true; data?: { id: string } }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };
