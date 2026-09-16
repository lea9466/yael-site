import { formatHebrewCalendarDate } from "@/lib/date/hebrew-calendar";

/**
 * Public-facing press date, rendered on the Hebrew calendar
 * (e.g. "כ״ז בטבת תשפ״ו").
 */
export function formatPressDate(isoDate: string | null): string {
  return formatHebrewCalendarDate(isoDate);
}

export function formatPressDateShort(isoDate: string | null): string {
  if (!isoDate) {
    return "—";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(date);
}

/** HTML date input value (yyyy-mm-dd) from timestamptz. */
export function toDateInputValue(isoDate: string | null): string {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Convert yyyy-mm-dd to ISO timestamptz at noon UTC. */
export function fromDateInputValue(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const iso = `${trimmed}T12:00:00.000Z`;
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return iso;
}
