import type { Metadata } from "next";

import { PressPublicListing } from "@/components/press/public/press-public-listing";
import { fetchPublishedPressArticles } from "@/lib/press/queries";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/press",
    title: "כתבות וראיונות",
    description:
      "כתבות, ראיונות וסיקור תקשורתי על אכילה מחוברת וליווי תזונתי.",
  });
}

export default async function PublicPressPage() {
  const articles = await fetchPublishedPressArticles();

  return <PressPublicListing articles={articles} />;
}
