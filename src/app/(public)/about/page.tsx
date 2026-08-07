import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutBreadcrumbJsonLd } from "@/components/about/about-breadcrumb-json-ld";
import { AboutPublicView } from "@/components/about/about-public-view";
import { fetchAboutPageDetail } from "@/lib/about/queries";
import { getDefaultAboutPageData } from "@/lib/about/defaults";
import { fetchCertificatesPageData } from "@/lib/certificates/queries";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { shortenForSeoDescription } from "@/lib/seo/resolve";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, aboutDetail] = await Promise.all([
    getWebsiteSettings(),
    fetchAboutPageDetail(),
  ]);

  const about = aboutDetail?.data ?? getDefaultAboutPageData();
  const firstParagraph = about.content.blocks.find(
    (block) => block.type === "paragraph"
  );
  const descriptionSource =
    about.seo?.description?.trim() ||
    about.intro_text?.trim() ||
    (firstParagraph && firstParagraph.type === "paragraph"
      ? firstParagraph.text
      : "") ||
    settings.siteSettings.default_seo.description;

  return buildSiteMetadata(settings, {
    path: "/about",
    title: about.seo?.title?.trim() || about.title,
    description: shortenForSeoDescription(descriptionSource),
    ogImage: aboutDetail?.coverPreview?.url ?? settings.ogImage?.url ?? null,
    ogImageAlt:
      aboutDetail?.coverPreview?.alt ??
      settings.ogImage?.alt ??
      settings.businessProfile.business_name,
  });
}

export default async function PublicAboutPage() {
  const [detail, certificatesData] = await Promise.all([
    fetchAboutPageDetail(),
    fetchCertificatesPageData(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <AboutBreadcrumbJsonLd />
      <AboutPublicView
        data={detail.data}
        coverPreview={detail.coverPreview}
        blockMediaUrls={detail.blockMediaUrls}
        certificates={certificatesData?.items ?? []}
        mode="public"
      />
    </>
  );
}
