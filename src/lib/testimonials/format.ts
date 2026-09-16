import { TESTIMONIAL_EXCERPT_LENGTH } from "@/lib/testimonials/constants";
import { normalizeTestimonialContent } from "@/lib/testimonials/text";

export function formatTestimonialDate(value: string): string {
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

export function getTestimonialExcerpt(
  content: string,
  maxLength = TESTIMONIAL_EXCERPT_LENGTH
): string {
  const normalized = normalizeTestimonialContent(content);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export function getTestimonialInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "ל";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

export function publicationStatusToPublished(
  status: "draft" | "published"
): boolean {
  return status === "published";
}

export function publishedToPublicationStatus(
  isPublished: boolean
): "draft" | "published" {
  return isPublished ? "published" : "draft";
}
