import { JsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site/constants";

type PressBreadcrumbJsonLdProps = {
  title: string;
  slug: string;
};

export function PressBreadcrumbJsonLd({
  title,
  slug,
}: PressBreadcrumbJsonLdProps) {
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
        name: "כתבות",
        item: `${SITE_ORIGIN}/press`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_ORIGIN}/press/${slug}`,
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}
