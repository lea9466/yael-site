import { z } from "zod";

import { RECIPE_DIFFICULTIES } from "@/lib/recipes/constants";

export const PUBLIC_RECIPES_PAGE_SIZE = 12;

export const PUBLIC_RECIPE_SORT_VALUES = [
  "newest",
  "oldest",
  "title",
] as const;

export type PublicRecipeSortValue = (typeof PUBLIC_RECIPE_SORT_VALUES)[number];

export const PUBLIC_RECIPE_DIFFICULTY_FILTERS = [
  "all",
  ...RECIPE_DIFFICULTIES,
] as const;

export type PublicRecipeDifficultyFilter =
  (typeof PUBLIC_RECIPE_DIFFICULTY_FILTERS)[number];

export const publicRecipeListingQuerySchema = z.object({
  q: z.string().trim().max(120).catch(""),
  tag: z.string().trim().max(120).catch("all"),
  difficulty: z.enum(PUBLIC_RECIPE_DIFFICULTY_FILTERS).catch("all"),
  sort: z.enum(PUBLIC_RECIPE_SORT_VALUES).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type PublicRecipeListingQuery = z.infer<
  typeof publicRecipeListingQuerySchema
>;

export function parsePublicRecipeListingSearchParams(input: {
  q?: string | string[];
  tag?: string | string[];
  difficulty?: string | string[];
  sort?: string | string[];
  page?: string | string[];
}): PublicRecipeListingQuery {
  return publicRecipeListingQuerySchema.parse({
    q: typeof input.q === "string" ? input.q : "",
    tag: typeof input.tag === "string" ? input.tag : "all",
    difficulty:
      typeof input.difficulty === "string" ? input.difficulty : "all",
    sort: typeof input.sort === "string" ? input.sort : "newest",
    page: typeof input.page === "string" ? input.page : "1",
  });
}
