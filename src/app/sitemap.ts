import type { MetadataRoute } from "next";

import { PUBLIC_STATIC_ROUTES } from "@/constants/public-navigation";
import {
  getPublishedBlogCategorySlugs,
  getPublishedPostSlugs,
  getPublishedRecipeCategorySlugs,
  getPublishedRecipeSlugs,
  getPublishedServiceSlugs,
} from "@/lib/public/queries";
import {
  buildBlogCategoryPath,
  buildPostPath,
} from "@/lib/public/blog-paths";
import { buildRecipeCategoryPath, buildRecipePath } from "@/lib/public/recipe-paths";
import {
  fetchPublishedPressSlugs,
  hasPublishedPressArticles,
} from "@/lib/press/queries";
import { getSiteOrigin } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const [
    services,
    recipes,
    recipeCategories,
    posts,
    blogCategories,
    pressArticles,
    includePressListing,
  ] = await Promise.all([
    getPublishedServiceSlugs(),
    getPublishedRecipeSlugs(),
    getPublishedRecipeCategorySlugs(),
    getPublishedPostSlugs(),
    getPublishedBlogCategorySlugs(),
    fetchPublishedPressSlugs(),
    hasPublishedPressArticles(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map(
    (route) => ({
      url: `${origin}${route.href}`,
      lastModified: new Date(),
      changeFrequency: route.href === "/" ? "weekly" : "monthly",
      priority: route.href === "/" ? 1 : 0.7,
    })
  );

  const pressListingEntries: MetadataRoute.Sitemap = includePressListing
    ? [
        {
          url: `${origin}/press`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.75,
        },
      ]
    : [];

  const serviceEntries: MetadataRoute.Sitemap = services.map((item) => ({
    url: `${origin}/services/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const recipeCategoryEntries: MetadataRoute.Sitemap = recipeCategories.map(
    (item) => ({
      url: `${origin}${buildRecipeCategoryPath(item.slug)}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: "weekly",
      priority: 0.75,
    })
  );

  const recipeEntries: MetadataRoute.Sitemap = recipes.map((item) => ({
    url: `${origin}${buildRecipePath(item.categorySlug, item.slug)}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogCategoryEntries: MetadataRoute.Sitemap = blogCategories.map(
    (item) => ({
      url: `${origin}${buildBlogCategoryPath(item.slug)}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: "weekly",
      priority: 0.75,
    })
  );

  const postEntries: MetadataRoute.Sitemap = posts.map((item) => ({
    url: `${origin}${buildPostPath(item.categorySlug, item.slug)}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const pressEntries: MetadataRoute.Sitemap = pressArticles.map((item) => ({
    url: `${origin}/press/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    ...staticEntries,
    ...pressListingEntries,
    ...serviceEntries,
    ...recipeCategoryEntries,
    ...recipeEntries,
    ...blogCategoryEntries,
    ...postEntries,
    ...pressEntries,
  ];
}
