import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RecipesListing } from "@/components/recipes/public/recipes-listing";
import { buildRecipeCategoryPath, buildRecipesPath } from "@/lib/public/recipe-paths";
import { getPublicRecipeListing } from "@/lib/public/recipe-listing";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";
import { parsePublicRecipeListingSearchParams } from "@/lib/validations/public-recipe-listing";

type RecipesPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    tag?: string | string[];
    difficulty?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: buildRecipesPath(),
    title: "מתכונים",
    description: "מתכונים בריאים וקלים להכנה",
  });
}

export default async function PublicRecipesPage({
  searchParams,
}: RecipesPageProps) {
  const params = await searchParams;
  const rawCategory =
    typeof params.category === "string" ? params.category : "";

  if (rawCategory) {
    const categorySlug = normalizeRouteSlug(rawCategory);
    if (categorySlug) {
      redirect(buildRecipeCategoryPath(categorySlug));
    }
  }

  const query = parsePublicRecipeListingSearchParams(params);
  const data = await getPublicRecipeListing({ query });

  return <RecipesListing data={data} />;
}
