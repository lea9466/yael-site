export function buildBlogPath(): string {
  return "/blog";
}

export function buildBlogCategoryPath(categorySlug: string): string {
  return `/blog/${categorySlug}`;
}

export function buildPostPath(
  categorySlug: string | null | undefined,
  postSlug: string
): string {
  if (categorySlug) {
    return `/blog/${categorySlug}/${postSlug}`;
  }

  return `/blog/${postSlug}`;
}

export function buildBlogListingSearchParams(input: {
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

export function buildBlogListingHref(
  basePath: string,
  input: {
    q?: string;
    tag?: string;
    sort?: string;
    page?: number;
  }
): string {
  return `${basePath}${buildBlogListingSearchParams(input)}`;
}
