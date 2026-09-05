import type { Metadata } from "next";

import { HomepageView } from "@/components/homepage/homepage-view";
import { fetchAboutPageDetail } from "@/lib/about/queries";
import { fetchCertificatesPageData } from "@/lib/certificates/queries";
import { getDefaultHomepageData } from "@/lib/homepage/defaults";
import { selectHomepageItems, takeHomepageLimit } from "@/lib/homepage/display";
import { fetchHomepageHeroPageData } from "@/lib/homepage/queries";
import {
  getHomepageContent,
  getPublishedPosts,
  getPublishedRecipes,
  getPublishedServices,
  getPublishedTestimonials,
  getWebsiteSettings,
} from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/",
    title: PUBLIC_PAGE_SEO.home.title,
    description: settings.siteSettings.default_seo.description,
    ogImage: settings.ogImage?.url ?? null,
    ogImageAlt: settings.ogImage?.alt ?? settings.businessProfile.business_name,
  });
}

export default async function PublicHomePage() {
  const [
    settings,
    homepageContent,
    heroPageData,
    aboutDetail,
    services,
    recipes,
    posts,
    testimonials,
    certificatesData,
  ] = await Promise.all([
    getWebsiteSettings(),
    getHomepageContent(),
    fetchHomepageHeroPageData(),
    fetchAboutPageDetail(),
    getPublishedServices(),
    getPublishedRecipes(),
    getPublishedPosts(),
    getPublishedTestimonials(),
    fetchCertificatesPageData(),
  ]);

  const homepage = homepageContent ?? getDefaultHomepageData();
  const heroDesktopMediaPreview = heroPageData?.heroDesktopMediaPreview ?? null;
  const heroMobileMediaPreview = heroPageData?.heroMobileMediaPreview ?? null;
  const heroSideMediaPreview = heroPageData?.heroSideMediaPreview ?? null;
  const aboutCoverPreview = aboutDetail?.coverPreview ?? null;

  const homepageServices = selectHomepageItems(services, "services");
  const homepageTestimonials = selectHomepageItems(testimonials, "testimonials");
  const homepagePosts = selectHomepageItems(posts, "recentPosts");
  const homepageRecipes = selectHomepageItems(recipes, "recentRecipes");
  const homepageCertificates = takeHomepageLimit(
    certificatesData?.items ?? [],
    "certificates"
  );

  return (
    <HomepageView
      homepage={homepage}
      heroDesktopMediaPreview={heroDesktopMediaPreview}
      heroMobileMediaPreview={heroMobileMediaPreview}
      heroSideMediaPreview={heroSideMediaPreview}
      aboutCoverPreview={aboutCoverPreview}
      settings={settings}
      services={homepageServices}
      testimonials={homepageTestimonials}
      certificates={homepageCertificates}
      posts={homepagePosts}
      recipes={homepageRecipes}
    />
  );
}
