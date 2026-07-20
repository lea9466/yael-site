import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { BlogListing } from "@/components/articles/public/blog-listing";
import {
  buildBlogCategoryPath,
  buildPostPath,
} from "@/lib/public/blog-paths";
import {
  getPublicBlogCategoryBySlug,
  getPublicBlogListing,
} from "@/lib/public/blog-listing";
import { getPublishedPostBySlug } from "@/lib/public/blog-detail";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";
import { parsePublicBlogListingSearchParams } from "@/lib/validations/public-blog-listing";

/** Avoid Next.js cache-tag header crash on non-ASCII (Hebrew) slugs. */
export const dynamic = "force-dynamic";

type BlogCategoryPageProps = {
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
}: BlogCategoryPageProps): Promise<Metadata> {
  const { categorySlug: rawSlug } = await params;
  const categorySlug = normalizeRouteSlug(rawSlug);
  const [settings, category] = await Promise.all([
    getWebsiteSettings(),
    getPublicBlogCategoryBySlug(categorySlug),
  ]);

  if (!category) {
    return buildSiteMetadata(settings, {
      path: buildBlogCategoryPath(categorySlug),
      title: "הקטגוריה לא נמצאה",
      noIndex: true,
    });
  }

  return buildSiteMetadata(settings, {
    path: buildBlogCategoryPath(category.slug),
    title: `פוסטים ב${category.name}`,
    description: `כל הפוסטים בנושא ${category.name} במקום אחד.`,
  });
}

export default async function PublicBlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const { categorySlug: rawSlug } = await params;
  const categorySlug = normalizeRouteSlug(rawSlug);
  const category = await getPublicBlogCategoryBySlug(categorySlug);

  if (!category) {
    const post = await getPublishedPostBySlug(categorySlug);

    if (post?.category?.slug) {
      permanentRedirect(buildPostPath(post.category.slug, post.slug));
    }

    notFound();
  }

  const query = parsePublicBlogListingSearchParams(await searchParams);
  const data = await getPublicBlogListing({
    categorySlug: category.slug,
    query,
  });

  return <BlogListing data={data} />;
}
