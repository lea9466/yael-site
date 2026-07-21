import type { MetadataRoute } from "next";

import { getWebsiteSettings } from "@/lib/public/queries";
import { SITE_MANIFEST_COLORS } from "@/lib/seo/metadata";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getWebsiteSettings();
  const { businessProfile, favicon } = settings;

  const icons: MetadataRoute.Manifest["icons"] = favicon?.url
    ? [
        {
          src: favicon.url,
          sizes: "any",
          type: "image/webp",
          purpose: "any",
        },
      ]
    : [
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
      ];

  return {
    name: businessProfile.business_name,
    short_name: businessProfile.business_name.slice(0, 12),
    description:
      businessProfile.short_description ??
      businessProfile.tagline ??
      settings.siteSettings.default_seo.description,
    start_url: "/",
    display: "standalone",
    background_color: SITE_MANIFEST_COLORS.background,
    theme_color: SITE_MANIFEST_COLORS.theme,
    lang: "he",
    dir: "rtl",
    icons,
  };
}
