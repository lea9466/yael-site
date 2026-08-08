import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site/constants";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

type SiteStructuredDataProps = {
  settings: WebsiteSettingsPublic;
};

function buildSameAs(
  social: WebsiteSettingsPublic["businessProfile"]["social"]
): string[] {
  const links = [
    social.instagram,
    social.facebook,
    social.youtube,
    social.tiktok,
    social.linkedin,
    social.pinterest,
  ].filter((value): value is string => Boolean(value));

  if (social.whatsapp?.startsWith("http")) {
    links.push(social.whatsapp);
  }

  return links;
}

/**
 * Sitewide Organization + Person + WebSite JSON-LD for Google rich results.
 */
export function SiteStructuredData({ settings }: SiteStructuredDataProps) {
  const { businessProfile } = settings;
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const personId = `${SITE_ORIGIN}/#person`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const description =
    (businessProfile.short_description
      ? normalizeMultilineTextForSeo(businessProfile.short_description)
      : null) ??
    businessProfile.tagline ??
    settings.siteSettings.default_seo.description;
  const sameAs = buildSameAs(businessProfile.social);
  const addressParts = [businessProfile.address, businessProfile.city].filter(
    Boolean
  );

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": organizationId,
    name: businessProfile.business_name,
    url: SITE_ORIGIN,
    description,
    logo: settings.logo?.url
      ? {
          "@type": "ImageObject",
          url: settings.logo.url,
        }
      : undefined,
    email: businessProfile.email || undefined,
    telephone: businessProfile.phone || undefined,
    address:
      addressParts.length > 0
        ? {
            "@type": "PostalAddress",
            streetAddress: businessProfile.address ?? undefined,
            addressLocality: businessProfile.city ?? undefined,
            addressCountry: "IL",
          }
        : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    founder: { "@id": personId },
  };

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name: businessProfile.business_name,
    url: `${SITE_ORIGIN}/about`,
    jobTitle: businessProfile.tagline || "מאמנת לאכילה מחוברת וליווי תזונתי",
    description,
    image: settings.logo?.url ?? undefined,
    worksFor: { "@id": organizationId },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsAbout: [
      "אכילה מחוברת",
      "ליווי תזונתי",
      "ליווי אישי",
      "סדנאות תזונה בריאה",
      "מתכונים בריאים",
      "תזונה",
    ],
    homeLocation: businessProfile.city
      ? {
          "@type": "Place",
          name: businessProfile.city,
          address: {
            "@type": "PostalAddress",
            addressLocality: businessProfile.city,
            addressCountry: "IL",
          },
        }
      : undefined,
  };

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": websiteId,
    name: businessProfile.business_name,
    url: SITE_ORIGIN,
    description: settings.siteSettings.default_seo.description,
    inLanguage: "he-IL",
    publisher: { "@id": organizationId },
  };

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [organization, person, website],
      }}
    />
  );
}

/** @deprecated Prefer SiteStructuredData — kept for import compatibility. */
export function OrganizationJsonLd({
  settings,
}: SiteStructuredDataProps) {
  return <SiteStructuredData settings={settings} />;
}
