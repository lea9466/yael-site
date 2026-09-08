import type { Metadata } from "next";

import { ServiceCard } from "@/components/homepage/service-card";
import { ServicesListingBreadcrumbJsonLd } from "@/components/services/public/services-listing-breadcrumb-json-ld";
import { SERVICES_LISTING_HIDDEN_SLUGS } from "@/constants/public-navigation";
import { getServiceCardSurface } from "@/lib/homepage/service-card-display";
import {
  getPublishedServices,
  getWebsiteSettings,
} from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/services",
    title: PUBLIC_PAGE_SEO.services.title,
    description: PUBLIC_PAGE_SEO.services.description,
  });
}

export default async function PublicServicesPage() {
  const services = (await getPublishedServices()).filter(
    (service) => !SERVICES_LISTING_HIDDEN_SLUGS.includes(service.slug)
  );
  const primaryFeaturedId =
    services.find((service) => service.featured)?.id ?? null;

  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 py-12 md:px-20 md:py-16">
      <ServicesListingBreadcrumbJsonLd />
      <header className="mb-10 max-w-2xl space-y-3">
        <h1 className="text-page-title">{PUBLIC_PAGE_SEO.services.heading}</h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          {PUBLIC_PAGE_SEO.services.intro}
        </p>
      </header>

      {services.length === 0 ? (
        <p className="text-body text-[var(--color-text-muted)]">
          אין שירותים מפורסמים כרגע.
        </p>
      ) : (
        <ul className="services-listing-grid grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.id} className="services-section__item">
              <ServiceCard
                service={service}
                variant="pathway"
                ordinal={index + 1}
                surface={getServiceCardSurface(index)}
                isPrimaryFeatured={service.id === primaryFeaturedId}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
