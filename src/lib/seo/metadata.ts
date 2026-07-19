import type { Metadata } from "next";

import { SITE_DOMAIN, SITE_ORIGIN } from "@/lib/site/constants";
import { buildCanonicalUrl } from "@/lib/seo/resolve";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

export type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  noIndex?: boolean;
};

function resolveTitle(
  title: string | undefined,
  settings: WebsiteSettingsPublic
): string {
  const trimmed = title?.trim();

  if (trimmed && trimmed.length > 0) {
    return trimmed;
  }

  return settings.siteSettings.default_seo.title;
}

function resolveDescription(
  description: string | undefined,
  settings: WebsiteSettingsPublic
): string {
  const trimmed = description?.trim();

  if (trimmed && trimmed.length > 0) {
    return trimmed;
  }

  return settings.siteSettings.default_seo.description;
}

function resolveOgImage(
  ogImage: string | null | undefined,
  settings: WebsiteSettingsPublic
): string | undefined {
  const imageUrl = ogImage ?? settings.ogImage?.url;

  if (!imageUrl || imageUrl.length === 0) {
    return undefined;
  }

  return imageUrl;
}

export function buildSiteMetadata(
  settings: WebsiteSettingsPublic,
  input: PageMetadataInput = {}
): Metadata {
  const title = resolveTitle(input.title, settings);
  const description = resolveDescription(input.description, settings);
  const canonicalPath = input.path ?? "/";
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const ogImageUrl = resolveOgImage(input.ogImage, settings);
  const ogImageAlt =
    input.ogImageAlt ?? settings.ogImage?.alt ?? settings.businessProfile.business_name;
  const allowIndex =
    !input.noIndex && settings.siteSettings.robots_indexing_enabled;

  const metadata: Metadata = {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: allowIndex,
      follow: allowIndex,
      googleBot: {
        index: allowIndex,
        follow: allowIndex,
      },
    },
    openGraph: {
      type: "website",
      locale: "he_IL",
      url: canonicalUrl,
      siteName: settings.businessProfile.business_name,
      title,
      description,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              alt: ogImageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };

  const verification = settings.siteSettings.google_site_verification;

  if (verification) {
    metadata.verification = {
      google: verification,
    };
  }

  return metadata;
}

export function buildDefaultSiteMetadata(
  settings: WebsiteSettingsPublic
): Metadata {
  return buildSiteMetadata(settings, {
    path: "/",
  });
}

export const SITE_MANIFEST_COLORS = {
  background: "#fdfbf7",
  theme: "#3f5f47",
} as const;

export function getSiteOrigin(): string {
  return SITE_ORIGIN;
}

export function getSiteDomain(): string {
  return SITE_DOMAIN;
}
