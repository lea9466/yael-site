import type { ShortAboutHighlightVariant } from "@/lib/homepage/short-about-highlights";
import type { CertificateListItem } from "@/lib/certificates/types";

export const CERTIFICATE_BADGE_MAX_LENGTH = 24;

export type CertificateCardBadge = {
  label: string;
  variant: ShortAboutHighlightVariant;
};

export type CertificateCardLayout = "featured" | "compact";
export type CertificateCardSurface = "cream" | "sage";

const BADGE_VARIANTS: ShortAboutHighlightVariant[] = [
  "mint",
  "teal",
  "gold",
  "coral",
];

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash + value.charCodeAt(index) * (index + 1)) % 997;
  }

  return hash;
}

export function getCertificateBadgeVariant(
  id: string
): ShortAboutHighlightVariant {
  return BADGE_VARIANTS[hashString(id) % BADGE_VARIANTS.length] ?? "mint";
}

function isShortBadgeDescription(description: string): boolean {
  return (
    description.length > 0 &&
    description.length <= CERTIFICATE_BADGE_MAX_LENGTH &&
    !description.includes("\n")
  );
}

export function getCertificateCardBadge(
  certificate: CertificateListItem
): CertificateCardBadge | null {
  const description = certificate.description?.trim() ?? "";

  if (isShortBadgeDescription(description)) {
    return {
      label: description,
      variant: getCertificateBadgeVariant(certificate.id),
    };
  }

  const year = certificate.year;
  const currentYear = new Date().getFullYear();

  if (
    year !== null &&
    year !== undefined &&
    year >= currentYear - 1
  ) {
    return { label: "חדש", variant: "teal" };
  }

  return null;
}

export function getCertificateCardExcerpt(
  certificate: CertificateListItem
): string | null {
  const description = certificate.description?.trim() ?? "";

  if (description.length === 0 || isShortBadgeDescription(description)) {
    return null;
  }

  return description;
}

export function getCertificateCardLayout(index: number): CertificateCardLayout {
  return index === 0 ? "featured" : "compact";
}

export function getCertificateCardSurface(
  index: number
): CertificateCardSurface {
  const surfaces: CertificateCardSurface[] = ["cream", "sage"];

  return surfaces[index % surfaces.length] ?? "cream";
}
