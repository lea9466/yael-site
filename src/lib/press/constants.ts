export const PRESS_STATUSES = ["draft", "published"] as const;

export type PressStatus = (typeof PRESS_STATUSES)[number];

export const PRESS_STATUS_LABELS: Record<PressStatus, string> = {
  draft: "טיוטה",
  published: "מפורסם",
};

export const PRESS_TITLE_MAX = 200;
export const PRESS_SLUG_MAX = 120;
export const PRESS_EXCERPT_MAX = 500;
export const PRESS_PUBLICATION_NAME_MAX = 160;
export const PRESS_SEO_TITLE_MAX = 70;
export const PRESS_SEO_DESCRIPTION_MAX = 160;

export const RESERVED_PRESS_SLUGS = ["press", "admin", "api"] as const;

export const PRESS_PAGE_SIZE = 20;
