import type { StoredSeo } from "@/lib/seo/types";
import type { ContentStatus } from "@/types/content";
import type {
  RecipeFeaturedFilter,
  RecipeSortValue,
  RecipeStatusFilter,
} from "@/lib/validations/recipe";

export type RecipeIngredient = {
  text: string;
};

export type RecipeStep = {
  text: string;
};

export type RecipeSection = {
  title: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};

export type RecipeGalleryItem = {
  media_id: string;
  order: number;
};

export type RecipeContent = {
  recipe_sections?: RecipeSection[];
  /** @deprecated Kept for backward compatibility with legacy recipes. */
  ingredients?: RecipeIngredient[];
  /** @deprecated Kept for backward compatibility with legacy recipes. */
  steps?: RecipeStep[];
  yael_tip: string | null;
  gallery: RecipeGalleryItem[];
};

export type RecipeSeo = StoredSeo;

export type RecipeRecord = {
  id: string;
  title: string;
  card_title: string | null;
  slug: string;
  description: string;
  cover_media_id: string;
  seo_og_media_id: string | null;
  category_id: string;
  prep_duration: string;
  servings: string;
  content: RecipeContent;
  seo: RecipeSeo;
  featured: boolean;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeTagSummary = {
  id: string;
  name: string;
};

export type RecipeCategorySummary = {
  id: string;
  name: string;
  slug?: string;
};

export type RecipeListItem = RecipeRecord & {
  coverUrl: string | null;
  coverAlt: string | null;
  categoryName: string | null;
  tagNames: string[];
};

export type RecipeDetail = RecipeRecord & {
  coverUrl: string | null;
  coverAlt: string | null;
  ogUrl: string | null;
  ogAlt: string | null;
  category: RecipeCategorySummary | null;
  tags: RecipeTagSummary[];
  galleryUrls: Array<{
    media_id: string;
    order: number;
    url: string | null;
    alt: string | null;
  }>;
};

export type RecipesListData = {
  items: RecipeListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  query: {
    q: string;
    status: RecipeStatusFilter;
    featured: RecipeFeaturedFilter;
    category: string;
    tag: string;
    sort: RecipeSortValue;
    page: number;
  };
  categories: RecipeCategorySummary[];
  tags: RecipeTagSummary[];
};

export type RecipeActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
