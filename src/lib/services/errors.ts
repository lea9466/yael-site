export const SERVICE_ERRORS = {
  unauthorized: "אין הרשאה לבצע פעולה זו.",
  generic: "אירעה שגיאה. נסו שוב מאוחר יותר.",
  notFound: "השירות לא נמצא.",
  slugTaken: "כתובת השירות כבר בשימוש.",
  slugReserved: "כתובת השירות שמורה למערכת.",
  slugInvalid: "כתובת השירות אינה תקינה.",
  coverRequired: "יש לבחור תמונת כיסוי.",
  coverRequiredPublish: "תמונת כיסוי נדרשת לפרסום.",
  mediaNotFound: "התמונה שנבחרה לא נמצאה.",
  invalidStatus: "סטטוס השירות אינו תקין.",
  archiveOnlyDelete: "ניתן למחוק לצמיתות רק שירות בארכיון.",
  duplicateFailed: "שכפול השירות נכשל.",
} as const;
