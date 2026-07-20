import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BlogListing } from "@/components/articles/public/blog-listing";
import { buildBlogCategoryPath, buildBlogPath } from "@/lib/public/blog-paths";
import { getPublicBlogListing } from "@/lib/public/blog-listing";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";
import { parsePublicBlogListingSearchParams } from "@/lib/validations/public-blog-listing";

type BlogPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    tag?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: buildBlogPath(),
    title: "פוסטים",
    description: "מאמרים, מדריכים וטיפים לתזונה ואורח חיים בריא.",
  });
}

export default async function PublicBlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const rawCategory =
    typeof params.category === "string" ? params.category : "";

  if (rawCategory) {
    const categorySlug = normalizeRouteSlug(rawCategory);
    if (categorySlug) {
      redirect(buildBlogCategoryPath(categorySlug));
    }
  }

  const query = parsePublicBlogListingSearchParams(params);
  const data = await getPublicBlogListing({ query });

  return <BlogListing data={data} />;
}
