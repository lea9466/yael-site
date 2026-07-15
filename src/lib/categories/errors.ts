export const CATEGORY_ERRORS = {
  unauthorized: "אין הרשאה לבצע פעולה זו.",
  generic: "אירעה שגיאה. נסו שוב מאוחר יותר.",
  notFound: "הקטגוריה לא נמצאה.",
  slugTaken: "כתובת הקטגוריה כבר בשימוש בסוג זה.",
  nameTaken: "שם הקטגוריה כבר קיים בסוג זה.",
  slugReserved: "כתובת זו שמורה למערכת.",
  slugInvalid: "כתובת הקטגוריה אינה תקינה.",
  mediaNotFound: "התמונה שנבחרה לא נמצאה.",
  inUse: "לא ניתן למחוק קטגוריה שמשויכת לתוכן.",
  typeImmutable: "לא ניתן לשנות את סוג הקטגוריה.",
} as const;
