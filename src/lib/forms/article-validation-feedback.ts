const FIELD_ELEMENT_MAP: Record<string, string> = {
  title: "article-title",
  card_title: "article-card-title",
  slug: "article-slug",
  cover_media_id: "field-cover-media",
  category_id: "article-category",
  tag_ids: "section-tags",
  "content.blocks": "section-content",
  "content.gallery": "section-gallery",
  "seo.title": "field-seo-title",
  "seo.description": "field-seo-description",
  seo_og_media_id: "field-seo-og-media",
};

const FIELD_PRIORITY = [
  "title",
  "slug",
  "cover_media_id",
  "category_id",
  "content.blocks",
  "content.gallery",
  "tag_ids",
  "seo.title",
  "seo.description",
  "seo_og_media_id",
];

const FIELD_LABELS: Record<string, string> = {
  title: "כותרת",
  card_title: "שם תצוגה בכרטיס",
  slug: "כתובת",
  cover_media_id: "תמונת כיסוי",
  category_id: "קטגוריה",
  tag_ids: "תגיות",
  "content.blocks": "תוכן הפוסט",
  "content.gallery": "גלריה",
  "seo.title": "כותרת SEO",
  "seo.description": "תיאור SEO",
  seo_og_media_id: "תמונת OG",
};

export function buildValidationSummary(
  fieldErrors: Record<string, string>,
  fallback: string
): string {
  const keys = FIELD_PRIORITY.filter((key) => key in fieldErrors);

  if (keys.length === 0) {
    return fallback;
  }

  const labels = keys
    .map((key) => FIELD_LABELS[key] ?? key)
    .slice(0, 3)
    .join(", ");

  return `יש לתקן: ${labels}.`;
}

export function focusFirstFieldError(fieldErrors: Record<string, string>): {
  focused: boolean;
} {
  const orderedKeys = [
    ...FIELD_PRIORITY.filter((key) => key in fieldErrors),
    ...Object.keys(fieldErrors).filter((key) => !FIELD_PRIORITY.includes(key)),
  ];

  for (const key of orderedKeys) {
    const elementId = FIELD_ELEMENT_MAP[key] ?? key;
    const target = document.getElementById(elementId);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      target.focus({ preventScroll: true });

      return { focused: true };
    }
  }

  return { focused: false };
}

export function getFieldErrorMessage(
  fieldErrors: Record<string, string>,
  field: string
): string | undefined {
  return fieldErrors[field];
}
