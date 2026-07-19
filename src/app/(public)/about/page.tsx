import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutPublicView } from "@/components/about/about-public-view";
import { fetchAboutPageDetail } from "@/lib/about/queries";
import { getDefaultAboutPageData } from "@/lib/about/defaults";
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
  const detail = await fetchAboutPageDetail();

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 py-12 md:px-20 md:py-16">
      <AboutPublicView
        data={detail.data}
        coverPreview={detail.coverPreview}
        blockMediaUrls={detail.blockMediaUrls}
        mode="public"
      />
    </div>
  );
}
