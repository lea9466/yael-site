export const TAG_ERRORS = {
  unauthorized: "אין הרשאה לבצע פעולה זו.",
  generic: "אירעה שגיאה. נסו שוב מאוחר יותר.",
  notFound: "התגית לא נמצאה.",
  slugTaken: "כתובת התגית כבר בשימוש בסוג זה.",
  nameTaken: "שם התגית כבר קיים בסוג זה.",
  slugReserved: "כתובת זו שמורה למערכת.",
  slugInvalid: "כתובת התגית אינה תקינה.",
  inUse: "לא ניתן למחוק תגית שמשויכת לתוכן.",
  typeImmutable: "לא ניתן לשנות את סוג התגית.",
} as const;
