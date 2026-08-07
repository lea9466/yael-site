import type { Metadata } from "next";

import { PublicFooter } from "@/components/public/footer/public-footer";
import { PublicHeader } from "@/components/public/header/public-header";
import { SkipToContent } from "@/components/public/layout/skip-to-content";
import { PublicScrollRestoration } from "@/components/public/scroll-restoration";
import { SiteStructuredData } from "@/components/public/seo/organization-json-ld";
import {
  buildPublicFooterNav,
  buildPublicPrimaryNav,
} from "@/constants/public-navigation";
import { hasPublishedPressArticles } from "@/lib/press/queries";
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
  const [settings, includePress] = await Promise.all([
    getWebsiteSettings(),
    hasPublishedPressArticles(),
  ]);

  const primaryNav = buildPublicPrimaryNav({ includePress });
  const footerNav = buildPublicFooterNav({ includePress });

  return (
    <div className="public-layout flex min-h-full flex-col">
      <SkipToContent />
      <SiteStructuredData settings={settings} />
      <PublicHeader settings={settings} navLinks={primaryNav} />
      <main
        id="main-content"
        tabIndex={-1}
        className="public-main flex flex-1 flex-col pt-[var(--public-header-height)] outline-none"
      >
        {children}
      </main>
      <PublicFooter settings={settings} navLinks={footerNav} />
      <PublicScrollRestoration />
    </div>
  );
}
