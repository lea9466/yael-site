import type { BusinessProfileData, SiteSettingsData } from "@/lib/validations/site-settings";

export function getDefaultBusinessProfile(): BusinessProfileData {
  return {
    business_name: "יעל קנייבסקי",
    legal_name: null,
    registration_number: null,
    email: "",
    phone: "",
    address: null,
    city: null,
    tagline: null,
    short_description: null,
    working_hours: [],
    social: {
      instagram: null,
      facebook: null,
      whatsapp: null,
      youtube: null,
      tiktok: null,
      linkedin: null,
      pinterest: null,
    },
    logo_media_id: null,
    favicon_media_id: null,
  };
}

export function getDefaultSiteSettings(): SiteSettingsData {
  return {
    default_seo: {
      title: "יעל קנייבסקי | מאמנת לאכילה מחוברת וליווי תזונתי",
      description:
        "מאמנת לאכילה מחוברת — ליווי אישי, סדנאות תזונה בריאה, מתכונים בריאים ומאמרים על תזונה עם יעל קנייבסקי.",
      og_media_id: null,
    },
    ga4_measurement_id: null,
    gtm_container_id: null,
    meta_pixel_id: null,
    google_site_verification: null,
    robots_indexing_enabled: true,
    maintenance_mode: false,
  };
}
