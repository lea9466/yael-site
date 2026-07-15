import type { RecipeFormSectionId } from "@/lib/recipes/constants";

const FIELD_SECTION_MAP: Record<string, RecipeFormSectionId> = {
  title: "basic",
  slug: "basic",
  description: "basic",
  cover_media_id: "basic",
  featured: "basic",
  category_id: "basic",
  duration_minutes: "details",
  servings: "details",
  difficulty: "details",
  tag_ids: "details",
  "content.ingredients": "ingredients",
  "content.steps": "steps",
  "content.yael_tip": "tip",
  "content.gallery": "gallery",
};

const FIELD_ELEMENT_MAP: Record<string, string> = {
  title: "recipe-title",
  slug: "recipe-slug",
  description: "recipe-description",
  cover_media_id: "field-cover-media",
  category_id: "recipe-category",
  duration_minutes: "recipe-duration",
  servings: "recipe-servings",
  difficulty: "recipe-difficulty",
  tag_ids: "section-details",
  "content.ingredients": "section-ingredients",
  "content.steps": "section-steps",
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
  "duration_minutes",
  "servings",
  "difficulty",
  "content.ingredients",
  "content.steps",
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
    /^content\.(ingredients|steps|yael_tip|gallery)(?:\.\d+(?:\.\w+)?)?$/.exec(
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

export function getSectionIdForField(path: string): RecipeFormSectionId | null {
  const normalized = normalizeFieldPath(path);

  return FIELD_SECTION_MAP[normalized] ?? null;
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
