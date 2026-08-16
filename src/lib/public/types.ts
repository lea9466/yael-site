import type { BusinessProfileData, SiteSettingsData } from "@/lib/validations/site-settings";
import type { HomepageData } from "@/lib/validations/homepage-hero";
import type { AboutPageData } from "@/lib/validations/about";

export type PublicMediaPreview = {
  id: string;
  url: string;
  alt: string;
};

export type WebsiteSettingsPublic = {
  businessProfile: BusinessProfileData;
  siteSettings: SiteSettingsData;
  logo: PublicMediaPreview | null;
  favicon: PublicMediaPreview | null;
  ogImage: PublicMediaPreview | null;
};

export type PublicServiceSummary = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  coverUrl: string | null;
  coverAlt: string | null;
  featured: boolean;
  published_at: string | null;
};

export type PublicRecipeSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  coverAlt: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  prep_duration: string;
  servings: string;
  featured: boolean;
  published_at: string | null;
};

export type PublicPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  reading_time_minutes: number;
  featured: boolean;
  published_at: string | null;
};

export type PublicPostSitemapEntry = {
  slug: string;
  updated_at: string;
};

export type PublicTestimonialSummary = {
  id: string;
  name: string;
  city: string | null;
  content: string;
  serviceTitle: string | null;
  featured: boolean;
};

export type PublicContentSlug = {
  slug: string;
  updated_at: string;
};

export type PublicRecipeSitemapEntry = {
  slug: string;
  categorySlug: string | null;
  updated_at: string;
};

export type PublicHomepageContent = HomepageData;
export type PublicAboutContent = AboutPageData;
