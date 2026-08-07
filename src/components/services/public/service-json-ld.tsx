import { JsonLd } from "@/lib/seo/json-ld";
import { buildServiceCanonicalUrl } from "@/lib/seo/resolve";
import { SITE_ORIGIN } from "@/lib/site/constants";
import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";
import { sanitizePlainText } from "@/lib/services/sanitize";
import type { ServiceDetail } from "@/lib/services/types";

type ServiceJsonLdProps = {
  service: ServiceDetail;
  providerName: string;
};

export function ServiceJsonLd({ service, providerName }: ServiceJsonLdProps) {
  const url = buildServiceCanonicalUrl(service.slug);
  const description = normalizeMultilineTextForSeo(
    sanitizePlainText(
      service.seo.description.trim() || service.short_description
    )
  );

  const serviceNode: Record<string, unknown> = {
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.title,
    url,
    description: description || undefined,
    provider: {
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/#person`,
      name: providerName,
    },
    areaServed: {
      "@type": "Country",
      name: "IL",
    },
    serviceType: "ליווי תזונתי",
  };

  if (service.coverUrl) {
    serviceNode.image = service.coverUrl;
  }

  if (service.published_at) {
    serviceNode.datePublished = service.published_at;
  }

  serviceNode.dateModified = service.updated_at;

  const graph: Array<Record<string, unknown>> = [serviceNode];

  const faqItems = service.content.faq
    .map((item) => ({
      question: sanitizePlainText(item.question),
      answer: sanitizePlainText(item.answer),
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0);

  if (faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": graph,
      }}
    />
  );
}
