import type { ServiceFormSectionId } from "@/lib/services/constants";

const FIELD_SECTION_MAP: Record<string, ServiceFormSectionId> = {
  title: "basic",
  card_title: "basic",
  short_description: "basic",
  cover_media_id: "basic",
  featured: "basic",
  full_introduction: "content",
  "content.target_audience": "audience",
  "content.audience_note_blocks": "audience",
  "content.benefits": "benefits",
  "content.process_steps": "process",
  "content.faq": "faq",
  "content.cta_title": "cta",
  "content.cta_text": "cta",
  "content.cta_button_label": "cta",
  "content.cta_link_type": "cta",
  "content.cta_link_url": "cta",
};

const FIELD_ELEMENT_MAP: Record<string, string> = {
  title: "service-title",
  card_title: "service-card-title",
  slug: "service-slug",
  short_description: "service-short-description",
  cover_media_id: "field-cover-media",
  full_introduction: "service-full-introduction",
  "content.target_audience": "section-audience",
  "content.audience_note_blocks": "section-audience",
  "content.benefits": "section-benefits",
  "content.process_steps": "section-process",
  "content.faq": "section-faq",
  "content.cta_title": "field-cta-title",
  "content.cta_text": "field-cta-text",
  "content.cta_button_label": "field-cta-button-label",
  "content.cta_link_url": "field-cta-link-url",
  "seo.title": "field-seo-title",
  "seo.description": "field-seo-description",
  seo_og_media_id: "field-seo-og-media",
};

const FIELD_PRIORITY = [
  "title",
  "slug",
  "short_description",
  "cover_media_id",
  "full_introduction",
  "content.target_audience",
  "content.benefits",
  "content.process_steps",
  "content.cta_title",
  "content.cta_text",
  "content.cta_button_label",
  "content.cta_link_url",
  "seo.title",
  "seo.description",
  "seo_og_media_id",
];

function normalizeFieldPath(path: string): string {
  if (FIELD_SECTION_MAP[path]) {
    return path;
  }

  const contentMatch = /^content\.(target_audience|audience_note_blocks|benefits|process_steps|faq|cta_\w+)(?:\.\d+(?:\.\w+)?)?$/.exec(
    path
  );

  if (contentMatch) {
    const base = `content.${contentMatch[1]}`;

    if (FIELD_SECTION_MAP[base]) {
      return base;
    }
  }

  const seoMatch = /^seo\.(title|description)$/.exec(path);

  if (seoMatch) {
    return `seo.${seoMatch[1]}`;
  }

  return path;
}

export function getSectionIdForField(path: string): ServiceFormSectionId | null {
  const normalized = normalizeFieldPath(path);

  return FIELD_SECTION_MAP[normalized] ?? null;
}

export function getSectionsWithErrors(
  fieldErrors: Record<string, string>
): Set<ServiceFormSectionId> {
  const sections = new Set<ServiceFormSectionId>();

  for (const path of Object.keys(fieldErrors)) {
    const sectionId = getSectionIdForField(path);

    if (sectionId) {
      sections.add(sectionId);
    }
  }

  return sections;
}

export function getFirstErrorField(
  fieldErrors: Record<string, string>
): string | null {
  for (const path of FIELD_PRIORITY) {
    if (fieldErrors[path]) {
      return path;
    }
  }

  const keys = Object.keys(fieldErrors);

  return keys.length > 0 ? normalizeFieldPath(keys[0]) : null;
}

export function focusFirstFieldError(fieldErrors: Record<string, string>): {
  sectionId: ServiceFormSectionId | null;
  fieldPath: string | null;
} {
  const fieldPath = getFirstErrorField(fieldErrors);

  if (!fieldPath) {
    return { sectionId: null, fieldPath: null };
  }

  const sectionId = getSectionIdForField(fieldPath);

  window.requestAnimationFrame(() => {
    const target = document.getElementById(
      FIELD_ELEMENT_MAP[fieldPath] ?? `section-${sectionId ?? "basic"}`
    );

    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });

    const focusable = target?.querySelector<HTMLElement>(
      "input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])"
    );

    focusable?.focus();
  });

  return { sectionId, fieldPath };
}

export function buildValidationSummary(
  fieldErrors: Record<string, string>,
  fallback: string
): string {
  const errorCount = Object.keys(fieldErrors).length;

  if (errorCount === 0) {
    return fallback;
  }

  const firstField = getFirstErrorField(fieldErrors);
  const firstMessage = firstField ? fieldErrors[firstField] : undefined;

  if (errorCount === 1 && firstMessage) {
    return firstMessage;
  }

  return `נמצאו ${errorCount} שדות לתיקון. ${firstMessage ?? fallback}`;
}

export function hasFieldError(
  fieldErrors: Record<string, string>,
  path: string
): boolean {
  if (fieldErrors[path]) {
    return true;
  }

  return Object.keys(fieldErrors).some((key) => key.startsWith(`${path}.`));
}

export function getFieldErrorMessage(
  fieldErrors: Record<string, string>,
  path: string
): string | undefined {
  if (fieldErrors[path]) {
    return fieldErrors[path];
  }

  const nestedKey = Object.keys(fieldErrors).find((key) =>
    key.startsWith(`${path}.`)
  );

  return nestedKey ? fieldErrors[nestedKey] : undefined;
}
