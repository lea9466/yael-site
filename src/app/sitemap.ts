import type { MetadataRoute } from "next";

import { PUBLIC_STATIC_ROUTES } from "@/constants/public-navigation";
import {
  getPublishedPostSlugs,
  getPublishedRecipeSlugs,
  getPublishedServiceSlugs,
} from "@/lib/public/queries";
import { getSiteOrigin } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const [services, recipes, posts] = await Promise.all([
    getPublishedServiceSlugs(),
    getPublishedRecipeSlugs(),
    getPublishedPostSlugs(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map(
    (route) => ({
      url: `${origin}${route.href}`,
      lastModified: new Date(),
      changeFrequency: route.href === "/" ? "weekly" : "monthly",
      priority: route.href === "/" ? 1 : 0.7,
    })
  );

  const serviceEntries: MetadataRoute.Sitemap = services.map((item) => ({
    url: `${origin}/services/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const recipeEntries: MetadataRoute.Sitemap = recipes.map((item) => ({
    url: `${origin}/recipes/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((item) => ({
    url: `${origin}/articles/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticEntries,
    ...serviceEntries,
    ...recipeEntries,
    ...postEntries,
  ];
}
