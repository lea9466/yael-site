export const TESTIMONIALS_PAGE_SIZE = 12;

export const TESTIMONIAL_NAME_MAX = 120;
export const TESTIMONIAL_CITY_MAX = 80;
export const TESTIMONIAL_CONTENT_MAX = 2000;
export const TESTIMONIAL_CONTENT_MIN = 10;
export const TESTIMONIAL_EXCERPT_LENGTH = 120;

export const TESTIMONIAL_PUBLICATION_STATUSES = ["draft", "published"] as const;

export type TestimonialPublicationStatus =
  (typeof TESTIMONIAL_PUBLICATION_STATUSES)[number];

export const TESTIMONIAL_PUBLICATION_STATUS_LABELS: Record<
  TestimonialPublicationStatus,
  string
> = {
  draft: "טיוטה",
  published: "מפורסם",
};

export const GENERAL_TESTIMONIAL_LABEL = "המלצה כללית";
