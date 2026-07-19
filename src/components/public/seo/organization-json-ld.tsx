import { SITE_ORIGIN } from "@/lib/site/constants";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

type OrganizationJsonLdProps = {
  settings: WebsiteSettingsPublic;
};

function buildSameAs(social: WebsiteSettingsPublic["businessProfile"]["social"]): string[] {
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

export function OrganizationJsonLd({ settings }: OrganizationJsonLdProps) {
  const { businessProfile } = settings;
  const addressParts = [businessProfile.address, businessProfile.city].filter(
    Boolean
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessProfile.business_name,
    url: SITE_ORIGIN,
    description:
      (businessProfile.short_description
        ? normalizeMultilineTextForSeo(businessProfile.short_description)
        : null) ??
      businessProfile.tagline ??
      settings.siteSettings.default_seo.description,
    logo: settings.logo?.url ?? undefined,
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
    sameAs: buildSameAs(businessProfile.social),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
