import { normalizeServiceAudienceIcon } from "@/lib/services/audience-icons";
import { createEmptyStoredSeo } from "@/lib/seo/resolve";
import type {
  ServiceAudienceItem,
  ServiceContent,
  ServiceSeo,
  ServiceTextItem,
} from "@/lib/services/types";

export function createDefaultServiceContent(): ServiceContent {
  return {
    target_audience: [],
    benefits: [],
    process_steps: [],
    faq: [],
    cta_title: "",
    cta_text: "",
    cta_button_label: "יצירת קשר",
    cta_link_type: "internal",
    cta_link_url: "/contact",
  };
}

export function createDefaultServiceSeo(): ServiceSeo {
  return createEmptyStoredSeo();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAudienceItems(value: unknown): ServiceAudienceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.text !== "string") {
      return [];
    }

    const text = item.text.trim();

    if (!text) {
      return [];
    }

    const icon = normalizeServiceAudienceIcon(
      typeof item.icon === "string" ? item.icon : undefined
    );

    return icon ? [{ text, icon }] : [{ text }];
  });
}

function normalizeTextItems(value: unknown): ServiceTextItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.text !== "string") {
      return [];
    }

    const text = item.text.trim();

    return text ? [{ text }] : [];
  });
}

/** Ensures content arrays/fields are safe for public rendering. */
export function normalizeServiceContent(value: unknown): ServiceContent {
  const defaults = createDefaultServiceContent();

  if (!isRecord(value)) {
    return defaults;
  }

  const processSteps = Array.isArray(value.process_steps)
    ? value.process_steps.flatMap((item) => {
        if (!isRecord(item)) {
          return [];
        }

        const title = typeof item.title === "string" ? item.title.trim() : "";
        const description =
          typeof item.description === "string" ? item.description.trim() : "";

        return title || description ? [{ title, description }] : [];
      })
    : [];

  const faq = Array.isArray(value.faq)
    ? value.faq.flatMap((item) => {
        if (!isRecord(item)) {
          return [];
        }

        const question =
          typeof item.question === "string" ? item.question.trim() : "";
        const answer =
          typeof item.answer === "string" ? item.answer.trim() : "";

        return question || answer ? [{ question, answer }] : [];
      })
    : [];

  const linkType =
    value.cta_link_type === "external" || value.cta_link_type === "internal"
      ? value.cta_link_type
      : defaults.cta_link_type;

  return {
    target_audience: normalizeAudienceItems(value.target_audience),
    benefits: normalizeTextItems(value.benefits),
    process_steps: processSteps,
    faq,
    cta_title:
      typeof value.cta_title === "string" ? value.cta_title : defaults.cta_title,
    cta_text:
      typeof value.cta_text === "string" ? value.cta_text : defaults.cta_text,
    cta_button_label:
      typeof value.cta_button_label === "string"
        ? value.cta_button_label
        : defaults.cta_button_label,
    cta_link_type: linkType,
    cta_link_url:
      typeof value.cta_link_url === "string"
        ? value.cta_link_url
        : defaults.cta_link_url,
  };
}

export { buildAutoSeoTitle, shortenForSeoDescription as buildAutoSeoDescription } from "@/lib/seo/resolve";
