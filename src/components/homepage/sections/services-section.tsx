import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { ServiceCard } from "@/components/homepage/service-card";
import { getServiceCardSurface } from "@/lib/homepage/service-card-display";
import type { PublicServiceSummary } from "@/lib/public/types";

type ServicesSectionProps = {
  services: PublicServiceSummary[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
  if (services.length === 0) {
    return null;
  }

  const primaryFeaturedId =
    services.find((service) => service.featured)?.id ?? null;

  return (
    <section
      aria-labelledby="homepage-services-title"
      className="services-section"
    >
      <div className="services-section__inner">
        <HomepageReveal>
          <PublicSectionHeader
            className="services-section__header"
            titleId="homepage-services-title"
            title="איך אפשר ללוות אתכם"
            description="ליווי תזונתי ואכילה מקושרת — בגישה אישית, חמה ומקצועית."
            actionLabel="לכל השירותים"
            actionHref="/services"
          />
        </HomepageReveal>

        <ul className="services-section__grid">
          {services.map((service, index) => (
            <li key={service.id} className="services-section__item">
              <HomepageReveal delayMs={index * 90} className="h-full">
                <ServiceCard
                  service={service}
                  variant="pathway"
                  ordinal={index + 1}
                  surface={getServiceCardSurface(index)}
                  isPrimaryFeatured={service.id === primaryFeaturedId}
                />
              </HomepageReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
