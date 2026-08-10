import type { HomepageData } from "@/lib/validations/homepage-hero";

export function getDefaultHomepageData(): HomepageData {
  return {
    hero: {
      title: "מאמנת אישית לאכילה מחוברת",
      subtitle: "יחד נבנה קשר בריא ומאוזן לאוכל — בלי דיאטות ובלי אשמה",
      primary_button: {
        label: "לשירותים",
        url: "/services",
      },
      secondary_button: null,
      media_type: "image",
      media_id: null,
      mobile_media_id: null,
      video_url: null,
      animation_url: null,
    },
    short_about: {
      title: "מי אני?",
      text: "נעים מאוד! עוד לא הכרנו?\n\nשמי יעל קנייבסקי ואני הכתובת למי שעייפה מדיאטות.\n\nאני מאמנת לאכילה מחוברת, ולמערכת יחסים בריאה ולא מסתבכת עם אוכל.",
    },
    approach: {
      title: "הגישה של יעל",
      text: "יחד נבנה תהליך אישי שמכבד את הגוף, את הרגש ואת החיים שלכם.",
    },
    contact_cta: {
      title: "רוצים לדבר?",
      text: "אשמח לשמוע מכם וללוות אתכם בדרך לאכילה מודעת ומאוזנת.",
      button_label: "יצירת קשר",
    },
  };
}
