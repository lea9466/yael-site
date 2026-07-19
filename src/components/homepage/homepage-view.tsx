import { ApproachSection } from "@/components/homepage/sections/approach-section";
// Temporary: certificates section hidden on homepage
// import { CertificatesSection } from "@/components/homepage/sections/certificates-section";
import { ContactCtaSection } from "@/components/homepage/sections/contact-cta-section";
import { HomepageHeroSection } from "@/components/homepage/sections/hero-section";
import { RecentPostsSection } from "@/components/homepage/sections/recent-posts-section";
import { RecentRecipesSection } from "@/components/homepage/sections/recent-recipes-section";
import { ServicesSection } from "@/components/homepage/sections/services-section";
import { ShortAboutSection } from "@/components/homepage/sections/short-about-section";
import { TestimonialsSection } from "@/components/homepage/sections/testimonials-section";
import type { AboutMediaPreview } from "@/lib/about/queries";
import type { CertificateListItem } from "@/lib/certificates/types";
import type { HomepageHeroMediaPreview } from "@/lib/homepage/queries";
import type {
  PublicPostSummary,
  PublicRecipeSummary,
  PublicServiceSummary,
  PublicTestimonialSummary,
  WebsiteSettingsPublic,
} from "@/lib/public/types";
import type { HomepageData } from "@/lib/validations/homepage-hero";

export type HomepageViewProps = {
  homepage: HomepageData;
  heroDesktopMediaPreview: HomepageHeroMediaPreview | null;
  heroMobileMediaPreview: HomepageHeroMediaPreview | null;
  aboutCoverPreview: AboutMediaPreview | null;
  settings: WebsiteSettingsPublic;
  services: PublicServiceSummary[];
  testimonials: PublicTestimonialSummary[];
  certificates: CertificateListItem[];
  posts: PublicPostSummary[];
  recipes: PublicRecipeSummary[];
};

export function HomepageView({
  homepage,
  heroDesktopMediaPreview,
  heroMobileMediaPreview,
  aboutCoverPreview,
  settings,
  services,
  testimonials,
  certificates: _certificates,
  posts,
  recipes,
}: HomepageViewProps) {
  return (
    <div className="public-page-enter">
      <HomepageHeroSection
        hero={homepage.hero}
        desktopMediaPreview={heroDesktopMediaPreview}
        mobileMediaPreview={heroMobileMediaPreview}
      />
      <ShortAboutSection
        content={homepage.short_about}
        coverPreview={aboutCoverPreview}
      />
      <ServicesSection services={services} />
      <ApproachSection content={homepage.approach} />
      <TestimonialsSection testimonials={testimonials} />
      {/* Temporary: certificates section hidden on homepage
      <CertificatesSection certificates={certificates} />
      */}
      <RecentPostsSection posts={posts} />
      <RecentRecipesSection recipes={recipes} />
      <ContactCtaSection content={homepage.contact_cta} settings={settings} />
    </div>
  );
}
