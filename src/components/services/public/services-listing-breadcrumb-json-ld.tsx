import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site/constants";

export function ServicesListingBreadcrumbJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "בית",
        item: SITE_ORIGIN,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "שירותים",
        item: `${SITE_ORIGIN}/services`,
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}
