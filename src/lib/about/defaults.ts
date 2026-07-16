import type { AboutPageData } from "@/lib/validations/about";

export function getDefaultAboutPageData(): AboutPageData {
  return {
    title: "אודות יעל",
    intro_text: "דיאטנית קלינית ומלווה תזונתית",
    content: {
      blocks: [
        {
          type: "paragraph",
          text: "כאן תוכלי לערוך את סיפור האישי, הגישה המקצועית והחוויה שלך — בחופשיות ובעיצוב עריכה עשיר.",
        },
      ],
      gallery: [],
    },
    cover_media_id: null,
    cta: {
      title: "רוצים להתחיל יחד?",
      text: "אשמח ללוות אתכם בתהליך אישי של אכילה מקושרת ומאוזנת.",
      button_label: "יצירת קשר",
      button_url: "/contact",
    },
  };
}
