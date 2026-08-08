import type { Metadata } from "next";

import { ContactPageJsonLd } from "@/components/contact/contact-page-json-ld";
import { ContactPageView } from "@/components/contact/contact-page-view";
import { resolvePublicContactLinks } from "@/lib/contact/public-links";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/contact",
    title: PUBLIC_PAGE_SEO.contact.title,
    description: PUBLIC_PAGE_SEO.contact.description,
  });
}

export default async function PublicContactPage() {
  const settings = await getWebsiteSettings();
  const links = resolvePublicContactLinks(settings.businessProfile);

  return (
    <>
      <ContactPageJsonLd settings={settings} />
      <ContactPageView links={links} />
    </>
  );
}
