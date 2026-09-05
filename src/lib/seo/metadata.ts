import type { Metadata } from "next";

import { SITE_DOMAIN, SITE_ORIGIN } from "@/lib/site/constants";
import { buildCanonicalUrl } from "@/lib/seo/resolve";
import { finalizeDocumentTitle } from "@/lib/seo/title";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

/**
 * Topic keywords for the site, emitted as the <meta name="keywords"> tag on
 * every page. Google ignores this tag for ranking, but it is still read by
 * other engines and by some social / AI crawlers.
 */
const SITE_SEO_KEYWORDS = [
  "יעל קנייבסקי",
  "אכילה רגשית",
  "הרזיה",
  "משקל",
  "מערכת יחסים עם אוכל",
  "בריאות",
  "מתכונים בריאים",
  "אכילה קשובה",
  "אכילה מחוברת",
  "נון-דיאט",
  "סדנאות בריאות",
  "בישול בריא",
  "אימון אישי",
  "אימון לאורח חיים בריא",
];

export type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  /** Open Graph type — use "article" for blog posts, recipes, and press. */
  ogType?: "website" | "article";
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

function resolveFaviconIcons(): Metadata["icons"] {
  // Served by src/app/icon.tsx and src/app/apple-icon.tsx from the CMS
  // favicon (with a brand fallback). Cache-bust so browsers / crawlers drop
  // the old placeholder mark they cached.
  const version = "v4";

  return {
    icon: [{ url: `/icon?${version}`, type: "image/png", sizes: "96x96" }],
    shortcut: [{ url: `/icon?${version}`, type: "image/png" }],
    apple: [
      { url: `/apple-icon?${version}`, type: "image/png", sizes: "180x180" },
    ],
  };
}

export function buildSiteMetadata(
  settings: WebsiteSettingsPublic,
  input: PageMetadataInput = {}
): Metadata {
  const rawTitle = resolveTitle(input.title, settings);
  const title = finalizeDocumentTitle(
    rawTitle,
    settings.businessProfile.business_name
  );
  const description = resolveDescription(input.description, settings);
  const canonicalPath = input.path ?? "/";
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const ogImageUrl = resolveOgImage(input.ogImage, settings);
  const ogImageAlt =
    input.ogImageAlt ?? settings.ogImage?.alt ?? settings.businessProfile.business_name;
  const allowIndex =
    !input.noIndex && settings.siteSettings.robots_indexing_enabled;
  const ogType = input.ogType ?? "website";

  const metadata: Metadata = {
    metadataBase: new URL(SITE_ORIGIN),
    // absolute avoids root layout template double-branding full SEO titles
    title: {
      absolute: title,
    },
    description,
    keywords: SITE_SEO_KEYWORDS,
    icons: resolveFaviconIcons(),
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
      type: ogType,
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
