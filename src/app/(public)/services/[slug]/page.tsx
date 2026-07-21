import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactCtaSection } from "@/components/homepage/sections/contact-cta-section";
import { ServicePublicView } from "@/components/services/service-public-view";
import { getDefaultHomepageData } from "@/lib/homepage/defaults";
import {
  getHomepageContent,
  getPublishedServiceBySlug,
  getWebsiteSettings,
} from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import {
  buildContentPath,
  resolveServiceSeo,
  shortenForSeoDescription,
} from "@/lib/seo/resolve";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

/** Avoid Next.js cache-tag header crash on non-ASCII (Hebrew) slugs. */
export const dynamic = "force-dynamic";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  const [settings, service] = await Promise.all([
    getWebsiteSettings(),
    getPublishedServiceBySlug(slug),
  ]);

  if (!service) {
    return buildSiteMetadata(settings, {
      path: buildContentPath("/services", slug),
      title: "השירות לא נמצא",
      noIndex: true,
    });
  }

  const seo = resolveServiceSeo({
    title: service.title,
    short_description: service.short_description,
    slug: service.slug,
    seo: service.seo,
  });

  const ogImage =
    service.ogUrl ?? service.coverUrl ?? settings.ogImage?.url ?? null;
  const ogImageAlt = service.ogAlt ?? service.coverAlt ?? service.title;

  const metadata = buildSiteMetadata(settings, {
    path: buildContentPath("/services", service.slug),
    title: seo.title,
    description:
      seo.description ||
      shortenForSeoDescription(service.short_description),
    ogImage,
    ogImageAlt,
  });

  const customCanonical = service.seo.canonical_url?.trim();

  if (customCanonical) {
    metadata.alternates = {
      ...metadata.alternates,
      canonical: customCanonical,
    };
  }

  return metadata;
}

export default async function PublicServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  const [service, settings, homepageContent] = await Promise.all([
    getPublishedServiceBySlug(slug),
    getWebsiteSettings(),
    getHomepageContent(),
  ]);

  if (!service) {
    notFound();
  }

  const homepage = homepageContent ?? getDefaultHomepageData();

  return (
    <>
      <ServicePublicView service={service} mode="public" />
      <div id="service-contact" className="service-page__contact">
        <ContactCtaSection
          content={homepage.contact_cta}
          settings={settings}
        />
      </div>
    </>
  );
}
