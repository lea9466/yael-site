const GEMATRIA_ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const GEMATRIA_TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const GEMATRIA_HUNDREDS = [
  "",
  "ק",
  "ר",
  "ש",
  "ת",
  "תק",
  "תר",
  "תש",
  "תת",
  "תתק",
];

/**
 * Hebrew-numeral (gematria) form of a positive integer, e.g. 27 → "כ״ז",
 * 786 → "תשפ״ו". Handles the 15/16 special cases (ט״ו / ט״ז) and adds the
 * geresh / gershayim punctuation. Intended for day-of-month (1–30) and the
 * last three digits of a Hebrew year.
 */
export function toGematria(value: number): string {
  let remainder = value % 1000;
  let letters = GEMATRIA_HUNDREDS[Math.floor(remainder / 100)] ?? "";
  remainder %= 100;

  if (remainder === 15) {
    letters += "טו";
  } else if (remainder === 16) {
    letters += "טז";
  } else {
    letters += GEMATRIA_TENS[Math.floor(remainder / 10)] ?? "";
    letters += GEMATRIA_ONES[remainder % 10] ?? "";
  }

  const chars = [...letters];

  if (chars.length === 0) {
    return "";
  }

  if (chars.length === 1) {
    return `${chars[0]}׳`;
  }

  return `${chars.slice(0, -1).join("")}״${chars[chars.length - 1]}`;
}

/**
 * A date rendered on the Hebrew calendar, e.g. "כ״ז בטבת תשפ״ו". Uses the
 * platform Intl Hebrew calendar for the conversion + month name and converts
 * the day / year to gematria. Falls back to a Hebrew Gregorian date if the
 * Hebrew-calendar conversion is unavailable.
 */
export function formatHebrewCalendarDate(isoDate: string | null): string {
  if (!isoDate) {
    return "—";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  try {
    const parts = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(date);

    const partValue = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? "";

    const day = toGematria(Number(partValue("day")));
    const month = partValue("month");
    const year = toGematria(Number(partValue("year")) % 1000);

    if (day && month && year) {
      return `${day} ב${month} ${year}`;
    }
  } catch {
    // fall through to the Gregorian fallback
  }

  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
