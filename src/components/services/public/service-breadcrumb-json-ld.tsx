import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site/constants";

type ServiceBreadcrumbJsonLdProps = {
  serviceTitle: string;
  serviceSlug: string;
};

export function ServiceBreadcrumbJsonLd({
  serviceTitle,
  serviceSlug,
}: ServiceBreadcrumbJsonLdProps) {
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
      {
        "@type": "ListItem",
        position: 3,
        name: serviceTitle,
        item: `${SITE_ORIGIN}/services/${serviceSlug}`,
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}
