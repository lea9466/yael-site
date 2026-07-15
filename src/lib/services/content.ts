import { createEmptyStoredSeo } from "@/lib/seo/resolve";
import type { ServiceContent, ServiceSeo } from "@/lib/services/types";

export function createDefaultServiceContent(): ServiceContent {
  return {
    target_audience: [],
    benefits: [],
    process_steps: [],
    faq: [],
    cta_title: "",
    cta_text: "",
    cta_button_label: "",
    cta_link_type: "internal",
    cta_link_url: "",
  };
}

export function createDefaultServiceSeo(): ServiceSeo {
  return createEmptyStoredSeo();
}

export { buildAutoSeoTitle, shortenForSeoDescription as buildAutoSeoDescription } from "@/lib/seo/resolve";
