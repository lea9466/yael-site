import type { Metadata } from "next";

import { PressPublicListing } from "@/components/press/public/press-public-listing";
import { fetchPublishedPressArticles } from "@/lib/press/queries";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/press",
    title: PUBLIC_PAGE_SEO.press.title,
    description: PUBLIC_PAGE_SEO.press.description,
  });
}

export default async function PublicPressPage() {
  const articles = await fetchPublishedPressArticles();

  return <PressPublicListing articles={articles} />;
}
