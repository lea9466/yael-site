import type { DatabaseTagRow } from "@/types/database";
import type { ListTagsQuery } from "@/lib/validations/tag";

export type TagRecord = DatabaseTagRow;

export type TagListItem = TagRecord & {
  usageCount: number;
};

export type TagsListData = {
  items: TagListItem[];
  query: ListTagsQuery;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
};

export type TagActionResult =
  | { success: true; data?: { id: string } }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export type TagUsageBreakdown = {
  recipeCount: number;
  articleCount: number;
  total: number;
};
