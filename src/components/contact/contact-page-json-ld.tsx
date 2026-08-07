import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site/constants";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

type ContactPageJsonLdProps = {
  settings: WebsiteSettingsPublic;
};

export function ContactPageJsonLd({ settings }: ContactPageJsonLdProps) {
  const { businessProfile } = settings;
  const addressParts = [businessProfile.address, businessProfile.city].filter(
    Boolean
  );

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "יצירת קשר",
    url: `${SITE_ORIGIN}/contact`,
    inLanguage: "he",
    mainEntity: {
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/#person`,
      name: businessProfile.business_name,
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
    },
  };

  return <JsonLd data={jsonLd} />;
}
