import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ContactCtaSection } from "@/components/homepage/sections/contact-cta-section";
import { RecipeBreadcrumbJsonLd } from "@/components/recipes/public/recipe-breadcrumb-json-ld";
import { RecipeJsonLd } from "@/components/recipes/public/recipe-json-ld";
import { RelatedRecipes } from "@/components/recipes/public/related-recipes";
import { RecipePublicView } from "@/components/recipes/recipe-public-view";
import { getDefaultHomepageData } from "@/lib/homepage/defaults";
import {
  getPublishedRecipeBySlug,
  getRelatedRecipes,
} from "@/lib/public/recipe-detail";
import { buildRecipePath } from "@/lib/public/recipe-paths";
import {
  getHomepageContent,
  getWebsiteSettings,
} from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { shortenForSeoDescription } from "@/lib/seo/resolve";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

/** Avoid Next.js cache-tag header crash on non-ASCII (Hebrew) slugs. */
export const dynamic = "force-dynamic";

type RecipeDetailPageProps = {
  params: Promise<{ categorySlug: string; recipeSlug: string }>;
};

export async function generateMetadata({
  params,
}: RecipeDetailPageProps): Promise<Metadata> {
  const { categorySlug: rawCategorySlug, recipeSlug: rawRecipeSlug } =
    await params;
  const categorySlug = normalizeRouteSlug(rawCategorySlug);
  const recipeSlug = normalizeRouteSlug(rawRecipeSlug);
  const [settings, recipe] = await Promise.all([
    getWebsiteSettings(),
    getPublishedRecipeBySlug(recipeSlug),
  ]);

  if (!recipe) {
    return buildSiteMetadata(settings, {
      path: buildRecipePath(categorySlug, recipeSlug),
      title: "מתכון לא נמצא",
      noIndex: true,
    });
  }

  const resolvedCategorySlug = recipe.category?.slug ?? categorySlug;
  const title = recipe.seo.title.trim() || recipe.title;
  const description =
    recipe.seo.description.trim() ||
    shortenForSeoDescription(recipe.description);
  const ogImage = recipe.ogUrl ?? recipe.coverUrl ?? settings.ogImage?.url ?? null;
  const ogImageAlt = recipe.ogAlt ?? recipe.coverAlt ?? recipe.title;

  const metadata = buildSiteMetadata(settings, {
    path: buildRecipePath(resolvedCategorySlug, recipe.slug),
    title,
    description,
    ogImage,
    ogImageAlt,
  });

  const customCanonical = recipe.seo.canonical_url?.trim();

  if (customCanonical) {
    metadata.alternates = {
      ...metadata.alternates,
      canonical: customCanonical,
    };
  }

  return metadata;
}

export default async function PublicRecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { categorySlug: rawCategorySlug, recipeSlug: rawRecipeSlug } =
    await params;
  const categorySlug = normalizeRouteSlug(rawCategorySlug);
  const recipeSlug = normalizeRouteSlug(rawRecipeSlug);
  const recipe = await getPublishedRecipeBySlug(recipeSlug);

  if (!recipe) {
    notFound();
  }

  if (recipe.category?.slug && recipe.category.slug !== categorySlug) {
    permanentRedirect(buildRecipePath(recipe.category.slug, recipe.slug));
  }

  const [settings, homepageContent, relatedRecipes] = await Promise.all([
    getWebsiteSettings(),
    getHomepageContent(),
    getRelatedRecipes({
      recipeId: recipe.id,
      categoryId: recipe.category_id,
      limit: 3,
    }),
  ]);

  const homepage = homepageContent ?? getDefaultHomepageData();

  return (
    <>
      <RecipeJsonLd recipe={recipe} />
      <RecipeBreadcrumbJsonLd
        recipeTitle={recipe.title}
        recipeSlug={recipe.slug}
        category={recipe.category}
      />

      <div className="recipe-page">
        <div className="recipe-page__main">
          <RecipePublicView recipe={recipe} mode="public" />
        </div>

        <RelatedRecipes recipes={relatedRecipes} />
        <ContactCtaSection
          content={homepage.contact_cta}
          settings={settings}
        />
      </div>
    </>
  );
}
