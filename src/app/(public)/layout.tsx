import type { Metadata } from "next";

import { PublicFooter } from "@/components/public/footer/public-footer";
import { PublicHeader } from "@/components/public/header/public-header";
import { SkipToContent } from "@/components/public/layout/skip-to-content";
import { PublicScrollRestoration } from "@/components/public/scroll-restoration";
import { OrganizationJsonLd } from "@/components/public/seo/organization-json-ld";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildDefaultSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildDefaultSiteMetadata(settings);
}

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getWebsiteSettings();

  return (
    <div className="public-layout flex min-h-full flex-col">
      <SkipToContent />
      <OrganizationJsonLd settings={settings} />
      <PublicHeader settings={settings} />
      <main
        id="main-content"
        tabIndex={-1}
        className="public-main flex flex-1 flex-col pt-[var(--public-header-height)] outline-none"
      >
        {children}
      </main>
      <PublicFooter settings={settings} />
      <PublicScrollRestoration />
    </div>
  );
}
