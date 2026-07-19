import type { MetadataRoute } from "next";

import { getWebsiteSettings } from "@/lib/public/queries";
import { getSiteOrigin } from "@/lib/seo/metadata";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getWebsiteSettings();
  const origin = getSiteOrigin();
  const allowIndexing = settings.siteSettings.robots_indexing_enabled;

  if (!allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${origin}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/login", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
