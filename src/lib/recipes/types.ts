import type { StoredSeo } from "@/lib/seo/types";
import type { RecipeDifficulty } from "@/lib/recipes/constants";
import type { ContentStatus } from "@/types/content";
import type {
  RecipeFeaturedFilter,
  RecipeSortValue,
  RecipeStatusFilter,
} from "@/lib/validations/recipe";

export type RecipeIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

export type RecipeStep = {
  text: string;
};

export type RecipeGalleryItem = {
  media_id: string;
  order: number;
};

export type RecipeContent = {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  yael_tip: string | null;
  gallery: RecipeGalleryItem[];
};

export type RecipeSeo = StoredSeo;

export type RecipeRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_media_id: string;
  seo_og_media_id: string | null;
  category_id: string;
  prep_duration: string;
  servings: string;
  difficulty: RecipeDifficulty;
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
