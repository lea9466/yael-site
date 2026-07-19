export const HOMEPAGE_SITE_CONTENT_KEY = "homepage" as const;

export const HOMEPAGE_SECTION_ORDER = [
  "hero",
  "short_about",
  "services",
  "approach",
  "testimonials",
  "certificates",
  "recent_posts",
  "recent_recipes",
  "contact_cta",
  "footer",
] as const;

export type HomepageSectionId = (typeof HOMEPAGE_SECTION_ORDER)[number];

export const HOMEPAGE_DISPLAY_LIMITS = {
  services: 3,
  testimonials: 5,
  certificates: 3,
  recentPosts: 3,
  recentRecipes: 3,
} as const;

export const HOMEPAGE_HERO_TITLE_MAX = 200;
export const HOMEPAGE_HERO_SUBTITLE_MAX = 300;
export const HOMEPAGE_HERO_BUTTON_LABEL_MAX = 80;
export const HOMEPAGE_HERO_BUTTON_URL_MAX = 2048;
export const HOMEPAGE_HERO_EXTERNAL_URL_MAX = 2048;

export const HOMEPAGE_SHORT_ABOUT_TITLE_MAX = 120;
export const HOMEPAGE_SHORT_ABOUT_TEXT_MAX = 1200;

export const HOMEPAGE_HERO_MEDIA_TYPES = [
  "image",
  "video_url",
  "animation_url",
] as const;

export type HomepageHeroMediaType = (typeof HOMEPAGE_HERO_MEDIA_TYPES)[number];
