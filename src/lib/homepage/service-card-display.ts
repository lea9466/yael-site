import type { ShortAboutHighlightVariant } from "@/lib/homepage/short-about-highlights";
import type { PublicServiceSummary } from "@/lib/public/types";

export type ServiceCardSurface = "white" | "sage" | "cream";

export const SERVICE_CARD_SURFACES: ServiceCardSurface[] = [
  "white",
  "sage",
  "cream",
];

export type ServiceCardBadge = {
  label: string;
  variant: ShortAboutHighlightVariant;
};

const NEW_SERVICE_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

function isRecentlyPublished(publishedAt: string | null): boolean {
  if (!publishedAt) {
    return false;
  }

  const publishedTime = Date.parse(publishedAt);

  if (Number.isNaN(publishedTime)) {
    return false;
  }

  return Date.now() - publishedTime <= NEW_SERVICE_WINDOW_MS;
}

export function getServiceCardBadge(
  service: PublicServiceSummary,
  isPrimaryFeatured: boolean
): ServiceCardBadge | null {
  if (isPrimaryFeatured) {
    return { label: "הכי מבוקש", variant: "coral" };
  }

  if (service.featured) {
    return { label: "מומלץ", variant: "gold" };
  }

  if (isRecentlyPublished(service.published_at)) {
    return { label: "חדש", variant: "teal" };
  }

  return null;
}

export function getServiceCardSurface(index: number): ServiceCardSurface {
  return SERVICE_CARD_SURFACES[index % SERVICE_CARD_SURFACES.length] ?? "white";
}
