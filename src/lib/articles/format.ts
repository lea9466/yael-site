import { formatReadingTime } from "@/lib/articles/reading-time";
import { formatHebrewCalendarDate } from "@/lib/date/hebrew-calendar";

export function formatArticleDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  }).format(date);
}

/** Public-facing post date, on the Hebrew calendar (e.g. "כ״ז בטבת תשפ״ו"). */
export function formatArticleDateShort(value: string): string {
  return formatHebrewCalendarDate(value);
}

export function formatArticleExcerpt(body: string, maxLength = 160): string {
  const normalized = body.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export { formatReadingTime };

export function formatReadingTimeLabel(minutes: number): string {
  return formatReadingTime(minutes);
}
