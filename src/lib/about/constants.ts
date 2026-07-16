export const ABOUT_SITE_CONTENT_KEY = "about" as const;

export const ABOUT_PAGE_TITLE_MAX = 120;
export const ABOUT_SUBTITLE_MAX = 240;
export const ABOUT_CTA_TITLE_MAX = 120;
export const ABOUT_CTA_TEXT_MAX = 500;
export const ABOUT_CTA_BUTTON_LABEL_MAX = 80;
export const ABOUT_CTA_BUTTON_URL_MAX = 2048;

export const ABOUT_PAGE_SECTION_ORDER = [
  "page_header",
  "cover_image",
  "rich_content",
  "closing_cta",
] as const;

export type AboutPageSectionId = (typeof ABOUT_PAGE_SECTION_ORDER)[number];
