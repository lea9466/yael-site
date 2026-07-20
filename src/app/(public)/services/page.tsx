import type { Metadata } from "next";

import { ServiceCard } from "@/components/homepage/service-card";
import {
  getPublishedServices,
  getWebsiteSettings,
} from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/services",
    title: "שירותים",
    description: "השירותים של יעל קנייבסקי — ליווי תזונתי ואכילה מחוברת.",
  });
}

export default async function PublicServicesPage() {
  const services = await getPublishedServices();

  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 py-12 md:px-20 md:py-16">
      <header className="mb-10 max-w-2xl space-y-3">
        <h1 className="text-page-title">שירותים</h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          ליווי אישי, תהליכים מותאמים וכלים מעשיים לאכילה מחוברת.
        </p>
      </header>

      {services.length === 0 ? (
        <p className="text-body text-[var(--color-text-muted)]">
          אין שירותים מפורסמים כרגע.
        </p>
      ) : (
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.id}>
              <ServiceCard
                service={service}
                isPrimaryFeatured={index === 0 && service.featured}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
