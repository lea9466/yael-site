import { ServiceCard } from "@/components/homepage/service-card";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { Container } from "@/components/public/layout/container";
import { Section } from "@/components/public/layout/section";
import type { PublicServiceSummary } from "@/lib/public/types";

type ServicesSectionProps = {
  services: PublicServiceSummary[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <Section ariaLabelledBy="homepage-services-title">
      <Container className="space-y-10">
        <PublicSectionHeader
          eyebrow="שירותים"
          title="איך אפשר ללוות אתכם"
          description="ליווי תזונתי ואכילה מקושרת — בגישה אישית, חמה ומקצועית."
          actionLabel="כל השירותים"
          actionHref="/services"
          titleId="homepage-services-title"
        />
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
