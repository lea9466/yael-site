import {
  CONTACT_MESSAGE_EXCERPT_LINES,
  CONTACT_MESSAGE_EXCERPT_MAX_LENGTH,
} from "@/lib/contact-messages/constants";

export function formatContactMessageDate(value: string): string {
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

export function getContactMessageInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "א";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

export function getContactMessageExcerpt(message: string): string {
  const normalized = message.replace(/\r\n/g, "\n").trim();

  if (normalized.length === 0) {
    return "";
  }

  const lines = normalized.split("\n").slice(0, CONTACT_MESSAGE_EXCERPT_LINES);
  let excerpt = lines.join("\n");

  if (excerpt.length > CONTACT_MESSAGE_EXCERPT_MAX_LENGTH) {
    excerpt = `${excerpt.slice(0, CONTACT_MESSAGE_EXCERPT_MAX_LENGTH).trimEnd()}…`;
  } else if (
    lines.length < normalized.split("\n").length &&
    !excerpt.endsWith("…")
  ) {
    excerpt = `${excerpt}…`;
  }

  return excerpt;
}

export function normalizeIsraeliPhoneForLinks(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 0) {
    return null;
  }

  if (digits.startsWith("972")) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return `972${digits.slice(1)}`;
  }

  if (digits.length >= 9) {
    return digits;
  }

  return null;
}

export function buildTelHref(phone: string): string | null {
  const normalized = normalizeIsraeliPhoneForLinks(phone);

  if (!normalized) {
    return null;
  }

  return `tel:+${normalized}`;
}

export function buildWhatsAppHref(phone: string): string | null {
  const normalized = normalizeIsraeliPhoneForLinks(phone);

  if (!normalized) {
    return null;
  }

  return `https://wa.me/${normalized}`;
}

/** Accepts a phone number or a full WhatsApp / http(s) URL from business profile. */
export function buildBusinessWhatsAppHref(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return buildWhatsAppHref(trimmed);
}

export function buildMailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}
