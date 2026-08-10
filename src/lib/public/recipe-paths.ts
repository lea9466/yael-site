export function buildRecipesPath(): string {
  return "/recipes";
}

export function buildRecipeCategoryPath(categorySlug: string): string {
  return `/recipes/${categorySlug}`;
}

export function buildRecipePath(
  categorySlug: string | null | undefined,
  recipeSlug: string
): string {
  if (categorySlug) {
    return `/recipes/${categorySlug}/${recipeSlug}`;
  }

  return `/recipes/${recipeSlug}`;
}

export function buildRecipeListingSearchParams(input: {
  q?: string;
  tag?: string;
  sort?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();

  const q = input.q?.trim() ?? "";
  if (q) {
    params.set("q", q);
  }

  const tag = input.tag?.trim() ?? "";
  if (tag && tag !== "all") {
    params.set("tag", tag);
  }

  const sort = input.sort?.trim() ?? "";
  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function buildRecipeListingHref(
  basePath: string,
  input: {
    q?: string;
    tag?: string;
    sort?: string;
    page?: number;
  }
): string {
  return `${basePath}${buildRecipeListingSearchParams(input)}`;
}
