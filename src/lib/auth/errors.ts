export const AUTH_ERRORS = {
  invalidCredentials: "פרטי ההתחברות שגויים",
  unauthorized: "אין הרשאה למערכת",
  generic: "אירעה שגיאה. נסו שוב מאוחר יותר.",
  inactivity: "החיבור נותק עקב חוסר פעילות. התחברו שוב.",
  currentPasswordInvalid: "הסיסמה הנוכחית שגויה",
  passwordWeak: "הסיסמה החדשה חלשה מדי. נסו סיסמה ארוכה וייחודית יותר.",
  passwordSame: "הסיסמה החדשה חייבת להיות שונה מהנוכחית",
} as const;
