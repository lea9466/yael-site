import type { ContentStatus } from "@/types/content";

import type { ServiceAudienceIconName } from "@/lib/services/audience-icons";
import type { StoredSeo } from "@/lib/seo/types";

export type ServiceTextItem = {
  text: string;
};

/** Audience item may include an optional Lucide icon name (CMS allowlist). */
export type ServiceAudienceItem = {
  text: string;
  icon?: ServiceAudienceIconName;
};

export type ServiceProcessStep = {
  title: string;
  description: string;
};

export type ServiceFaqItem = {
  question: string;
  answer: string;
};

export type ServiceCtaLinkType = "internal" | "external";

export type ServiceContent = {
  target_audience: ServiceAudienceItem[];
  benefits: ServiceTextItem[];
  process_steps: ServiceProcessStep[];
  faq: ServiceFaqItem[];
  cta_title: string;
  cta_text: string;
  cta_button_label: string;
  cta_link_type: ServiceCtaLinkType;
  cta_link_url: string;
};

export type ServiceSeo = StoredSeo;

export type ServiceRecord = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_introduction: string;
  cover_media_id: string | null;
  seo_og_media_id: string | null;
  content: ServiceContent;
  seo: ServiceSeo;
  featured: boolean;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceListItem = ServiceRecord & {
  coverUrl: string | null;
  coverAlt: string | null;
};

export type ServiceDetail = ServiceRecord & {
  coverUrl: string | null;
  coverAlt: string | null;
  ogUrl: string | null;
  ogAlt: string | null;
};

export type ServicesListData = {
  items: ServiceListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  query: {
    q: string;
    status: ServiceStatusFilter;
    featured: ServiceFeaturedFilter;
    sort: ServiceSortValue;
    page: number;
  };
};

export type ServiceActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export const SERVICE_STATUS_FILTERS = [
  "all",
  "draft",
  "published",
  "archived",
] as const;

export type ServiceStatusFilter = (typeof SERVICE_STATUS_FILTERS)[number];

export const SERVICE_FEATURED_FILTERS = ["all", "featured"] as const;

export type ServiceFeaturedFilter = (typeof SERVICE_FEATURED_FILTERS)[number];

export const SERVICE_SORT_VALUES = [
  "newest",
  "oldest",
  "title",
  "updated",
] as const;

export type ServiceSortValue = (typeof SERVICE_SORT_VALUES)[number];
