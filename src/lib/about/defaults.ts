import type { AboutPageData } from "@/lib/validations/about";

export function getDefaultAboutPageData(): AboutPageData {
  return {
    title: "מי אני?",
    intro_text: null,
    content: {
      blocks: [
        {
          type: "paragraph",
          text: "נעים מאוד! עוד לא הכרנו?",
        },
        {
          type: "paragraph",
          text: "שמי יעל קנייבסקי ואני הכתובת למי שעייפה מדיאטות.",
        },
        {
          type: "paragraph",
          text: "אני מאמנת לאכילה מחוברת, ולמערכת יחסים בריאה ולא מסתבכת עם אוכל.",
        },
        {
          type: "paragraph",
          text: "יש לי נסיון של מעל 6 שנים בתחום התזונה, ליוויתי עשרות לקוחות,",
        },
        {
          type: "paragraph",
          text: "והכי חשוב עברתי מסע בעצמי ואני יודעת כמה נושא האכילה והמשקל יכולים להיות אישיו,",
        },
        {
          type: "paragraph",
          text: "אבל יש גם דרך אחרת, של שלום ושקט.",
        },
        {
          type: "paragraph",
          text: "אשמח להכיר לך אותה",
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
