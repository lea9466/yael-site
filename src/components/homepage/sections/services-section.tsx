import Link from "next/link";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
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
        <header className="services-section__header">
          <h2 id="homepage-services-title" className="services-section__title">
            איך אפשר ללוות אתכם
          </h2>
          <p className="services-section__description">
            ליווי תזונתי ואכילה מקושרת — בגישה אישית, חמה ומקצועית.
          </p>
          <Link href="/services" className="services-section__action public-focus-ring">
            כל השירותים
          </Link>
        </header>

        <ul className="services-section__grid">
          {services.map((service, index) => (
            <li key={service.id} className="services-section__item">
              <HomepageReveal delayMs={index * 90} className="h-full">
                <ServiceCard
                  service={service}
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
