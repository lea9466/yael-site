/**
 * Public listing-page SEO copy tuned for Hebrew free-search intents.
 * Keep titles ≤70 and descriptions ≤160 characters.
 */
export const PUBLIC_PAGE_SEO = {
  home: {
    // Browser-tab / Google title for the homepage. finalizeDocumentTitle
    // appends "| יעל קנייבסקי".
    title: "תרגישו בבית",
    description:
      "מאמנת לאכילה מחוברת — ליווי אישי, סדנאות תזונה בריאה, מתכונים בריאים ומאמרים על תזונה עם יעל קנייבסקי.",
  },
  services: {
    title: "ליווי תזונתי וסדנאות | שירותים",
    description:
      "ליווי אישי בתזונה ואכילה מחוברת, סדנאות בישול בריא ותהליכים מותאמים עם יעל קנייבסקי.",
    heading: "עוד דברים טובים",
    intro: "מוצרים ושירותים",
  },
  recipes: {
    title: "מתכונים בריאים וקלים",
    description:
      "מתכונים בריאים וקלים להכנה — מאפים, סלטים, עוגות ועוד, עם יעל קנייבסקי.",
    heading: "משהו טוב מתבשל פה",
    intro: "מתכונים בריאים, מאוזנים וטעימים",
  },
  blog: {
    title: "תוכן טוב",
    description:
      "מאמרים על תזונה, טיפים לאכילה מחוברת ומדריכים לאורח חיים בריא עם יעל קנייבסקי.",
    eyebrow: "משהו טוב קורא פה",
    heading: "תוכן טוב",
    intro: "פוסטים מחברים על הקשר שלנו עם האוכל.",
  },
  contact: {
    title: "יצירת קשר | ליווי תזונתי",
    description:
      "צרו קשר עם יעל קנייבסקי לליווי אישי בתזונה ואכילה מחוברת — שיחה אישית ורגועה.",
  },
  press: {
    title: "מאחורי העיתון",
    description:
      "כתבות וראיונות על יעל קנייבסקי — אכילה מחוברת, ליווי תזונתי ותזונה בריאה.",
  },
  about: {
    title: "הסיפור שלי",
    description:
      "הכירו את יעל קנייבסקי — מאמנת לאכילה מחוברת וליווי תזונתי, עם סדנאות, מתכונים בריאים ומאמרים על תזונה.",
  },
} as const;
