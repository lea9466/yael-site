export const BUSINESS_PROFILE_SITE_CONTENT_KEY = "business_profile" as const;
export const SITE_SETTINGS_SITE_CONTENT_KEY = "site_settings" as const;

export const SITE_NAME_MAX = 120;
export const TAGLINE_MAX = 160;
export const SHORT_DESCRIPTION_MAX = 300;
export const ADDRESS_MAX = 300;
export const CITY_MAX = 80;
export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MAX = 160;
export const ANALYTICS_ID_MAX = 64;
export const VERIFICATION_CODE_MAX = 120;

export const WEEKDAYS = [
  { value: "sunday", label: "יום ראשון" },
  { value: "monday", label: "יום שני" },
  { value: "tuesday", label: "יום שלישי" },
  { value: "wednesday", label: "יום רביעי" },
  { value: "thursday", label: "יום חמישי" },
  { value: "friday", label: "יום שישי" },
  { value: "saturday", label: "שבת" },
] as const;

export type WeekdayValue = (typeof WEEKDAYS)[number]["value"];

export const SETTINGS_TABS = [
  { id: "general", label: "כללי" },
  { id: "homepage", label: "דף הבית" },
  { id: "contact", label: "יצירת קשר" },
  { id: "seo", label: "SEO" },
  { id: "analytics", label: "אנליטיקות" },
  { id: "branding", label: "מיתוג" },
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];
