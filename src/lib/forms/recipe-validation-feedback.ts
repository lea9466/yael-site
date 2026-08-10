import type { RecipeFormSectionId } from "@/lib/recipes/constants";

const FIELD_SECTION_MAP: Record<string, RecipeFormSectionId> = {
  title: "basic",
  description: "basic",
  cover_media_id: "basic",
  featured: "basic",
  category_id: "basic",
  prep_duration: "details",
  servings: "details",
  tag_ids: "details",
  "content.recipe_sections": "sections",
  "content.yael_tip": "tip",
  "content.gallery": "gallery",
};

const FIELD_ELEMENT_MAP: Record<string, string> = {
  title: "recipe-title",
  slug: "recipe-slug",
  description: "recipe-description",
  cover_media_id: "field-cover-media",
  category_id: "recipe-category",
  prep_duration: "recipe-prep-duration",
  servings: "recipe-servings",
  tag_ids: "section-details",
  "content.recipe_sections": "section-recipe-sections",
  "content.yael_tip": "recipe-yael-tip",
  "content.gallery": "section-gallery",
  "seo.title": "field-seo-title",
  "seo.description": "field-seo-description",
  seo_og_media_id: "field-seo-og-media",
};

const FIELD_PRIORITY = [
  "title",
  "slug",
  "description",
  "cover_media_id",
  "category_id",
  "prep_duration",
  "servings",
  "content.recipe_sections",
  "content.yael_tip",
  "content.gallery",
  "tag_ids",
  "seo.title",
  "seo.description",
  "seo_og_media_id",
];

function normalizeFieldPath(path: string): string {
  if (FIELD_SECTION_MAP[path]) {
    return path;
  }

  const contentMatch =
    /^content\.(recipe_sections|yael_tip|gallery)(?:\.\d+(?:\.\w+)?)?$/.exec(
      path
    );

  if (contentMatch) {
    const base = `content.${contentMatch[1]}`;

    if (FIELD_SECTION_MAP[base]) {
      return base;
    }
  }

  const sectionFieldMatch =
    /^content\.recipe_sections\.(\d+)(?:\.(title|ingredients|steps)(?:\.\d+(?:\.\w+)?)?)?$/.exec(
      path
    );

  if (sectionFieldMatch) {
    const sectionIndex = sectionFieldMatch[1];
    const field = sectionFieldMatch[2];

    if (field === "title") {
      return `recipe-section-title-${sectionIndex}`;
    }

    if (field === "ingredients") {
      return `recipe-section-ingredients-${sectionIndex}`;
    }

    if (field === "steps") {
      return `recipe-section-steps-${sectionIndex}`;
    }

    return `recipe-section-${sectionIndex}`;
  }

  const seoMatch = /^seo\.(title|description)$/.exec(path);

  if (seoMatch) {
    return `seo.${seoMatch[1]}`;
  }

  return path;
}

export function getSectionIdForField(path: string): RecipeFormSectionId | null {
  const normalized = normalizeFieldPath(path);

  if (FIELD_SECTION_MAP[normalized]) {
    return FIELD_SECTION_MAP[normalized];
  }

  if (
    normalized.startsWith("recipe-section-") ||
    normalized === "content.recipe_sections"
  ) {
    return "sections";
  }

  return null;
}

export function getSectionsWithErrors(
  fieldErrors: Record<string, string>
): Set<RecipeFormSectionId> {
  const sections = new Set<RecipeFormSectionId>();

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

  const sectionError = Object.keys(fieldErrors).find((key) =>
    key.startsWith("content.recipe_sections")
  );

  if (sectionError) {
    return sectionError;
  }

  const keys = Object.keys(fieldErrors);

  return keys.length > 0 ? normalizeFieldPath(keys[0]) : null;
}

export function focusFirstFieldError(fieldErrors: Record<string, string>): {
  sectionId: RecipeFormSectionId | null;
  fieldPath: string | null;
} {
  const fieldPath = getFirstErrorField(fieldErrors);

  if (!fieldPath) {
    return { sectionId: null, fieldPath: null };
  }

  const sectionId = getSectionIdForField(fieldPath);
  const normalized = normalizeFieldPath(fieldPath);

  window.requestAnimationFrame(() => {
    const target = document.getElementById(
      FIELD_ELEMENT_MAP[normalized] ??
        FIELD_ELEMENT_MAP[fieldPath] ??
        (normalized.startsWith("recipe-section-")
          ? normalized
          : `section-${sectionId ?? "basic"}`)
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
