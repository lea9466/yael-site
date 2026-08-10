import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { RecipesListing } from "@/components/recipes/public/recipes-listing";
import {
  buildRecipeCategoryPath,
  buildRecipePath,
} from "@/lib/public/recipe-paths";
import {
  getPublicRecipeCategoryBySlug,
  getPublicRecipeListing,
} from "@/lib/public/recipe-listing";
import { resolvePublicRecipePage } from "@/lib/public/recipe-detail";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";
import { parsePublicRecipeListingSearchParams } from "@/lib/validations/public-recipe-listing";

/** Avoid Next.js cache-tag header crash on non-ASCII (Hebrew) slugs. */
export const dynamic = "force-dynamic";

type RecipeCategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{
    q?: string | string[];
    tag?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: RecipeCategoryPageProps): Promise<Metadata> {
  const { categorySlug: rawSlug } = await params;
  const categorySlug = normalizeRouteSlug(rawSlug);
  const [settings, category] = await Promise.all([
    getWebsiteSettings(),
    getPublicRecipeCategoryBySlug(categorySlug),
  ]);

  if (!category) {
    return buildSiteMetadata(settings, {
      path: buildRecipeCategoryPath(categorySlug),
      title: "הקטגוריה לא נמצאה",
      noIndex: true,
    });
  }

  return buildSiteMetadata(settings, {
    path: buildRecipeCategoryPath(category.slug),
    title: `מתכוני ${category.name}`,
    description: `כל מתכוני ${category.name} הבריאים של יעל במקום אחד.`,
  });
}

export default async function PublicRecipeCategoryPage({
  params,
  searchParams,
}: RecipeCategoryPageProps) {
  const { categorySlug: rawSlug } = await params;
  const categorySlug = normalizeRouteSlug(rawSlug);
  const category = await getPublicRecipeCategoryBySlug(categorySlug);

  if (!category) {
    const resolved = await resolvePublicRecipePage(categorySlug);

    if (resolved?.recipe.category?.slug) {
      permanentRedirect(
        buildRecipePath(resolved.recipe.category.slug, resolved.recipe.slug)
      );
    }

    notFound();
  }

  const query = parsePublicRecipeListingSearchParams(await searchParams);
  const data = await getPublicRecipeListing({
    categorySlug: category.slug,
    query,
  });

  return <RecipesListing data={data} />;
}
