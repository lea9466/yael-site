import { z } from "zod";

export const PUBLIC_BLOG_PAGE_SIZE = 12;

export const PUBLIC_BLOG_SORT_VALUES = [
  "newest",
  "oldest",
  "title",
] as const;

export type PublicBlogSortValue = (typeof PUBLIC_BLOG_SORT_VALUES)[number];

export const publicBlogListingQuerySchema = z.object({
  q: z.string().trim().max(120).catch(""),
  tag: z.string().trim().max(120).catch("all"),
  sort: z.enum(PUBLIC_BLOG_SORT_VALUES).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type PublicBlogListingQuery = z.infer<
  typeof publicBlogListingQuerySchema
>;

export function parsePublicBlogListingSearchParams(input: {
  q?: string | string[];
  tag?: string | string[];
  sort?: string | string[];
  page?: string | string[];
}): PublicBlogListingQuery {
  return publicBlogListingQuerySchema.parse({
    q: typeof input.q === "string" ? input.q : "",
    tag: typeof input.tag === "string" ? input.tag : "all",
    sort: typeof input.sort === "string" ? input.sort : "newest",
    page: typeof input.page === "string" ? input.page : "1",
  });
}
