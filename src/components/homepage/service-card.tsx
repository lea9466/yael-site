import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
import {
  getServiceCardBadge,
  type ServiceCardSurface,
} from "@/lib/homepage/service-card-display";
import type { PublicServiceSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type ServiceCardProps = {
  service: PublicServiceSummary;
  surface?: ServiceCardSurface;
  isPrimaryFeatured?: boolean;
  /** Pathway layout for homepage; media layout for /services listing. */
  variant?: "pathway" | "media";
  /** 1-based ordinal shown on pathway cards (01, 02…). */
  ordinal?: number;
  className?: string;
};

const surfaceClasses: Record<ServiceCardSurface, string> = {
  white: "service-card--white",
  sage: "service-card--sage",
  cream: "service-card--cream",
};

function formatOrdinal(ordinal: number): string {
  return String(ordinal).padStart(2, "0");
}

export function ServiceCard({
  service,
  surface = "white",
  isPrimaryFeatured = false,
  variant = "media",
  ordinal,
  className,
}: ServiceCardProps) {
  const badge = getServiceCardBadge(service, isPrimaryFeatured);
  const href = `/services/${service.slug}`;
  const isPathway = variant === "pathway";
  const cardTitle = service.card_title?.trim() || service.title;

  return (
    <article
      className={cn(
        "service-card group",
        isPathway ? "service-card--pathway" : "service-card--media",
        surfaceClasses[surface],
        className
      )}
    >
      {badge ? (
        <PublicHighlightPill
          label={badge.label}
          variant={badge.variant}
          floating={false}
          className="service-card__badge"
        />
      ) : null}

      <div className="service-card__media-wrap">
        {isPathway && ordinal != null ? (
          <span aria-hidden="true" className="service-card__ordinal">
            {formatOrdinal(ordinal)}
          </span>
        ) : null}

        <Link
          href={href}
          className="service-card__media public-focus-ring"
          aria-label={cardTitle}
        >
          {service.coverUrl ? (
            <Image
              src={service.coverUrl}
              alt={service.coverAlt ?? service.title}
              fill
              sizes={
                isPathway
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className="service-card__image"
            />
          ) : (
            <div className="service-card__media-fallback">{cardTitle}</div>
          )}
        </Link>
      </div>

      <div className="service-card__body">
        <div className="service-card__copy">
          <h3 className="service-card__title">
            <Link
              href={href}
              className="public-focus-ring rounded-[var(--radius-sm)]"
            >
              {cardTitle}
            </Link>
          </h3>
          <MultilineText as="p" className="service-card__description">
            {service.short_description}
          </MultilineText>
        </div>

        <Link
          href={href}
          className={cn(
            "service-card__cta public-focus-ring",
            isPathway
              ? "service-card__cta--pathway"
              : "hero-btn hero-btn--secondary"
          )}
        >
          <span>לפרטים</span>
          {isPathway ? (
            <ArrowLeft aria-hidden="true" className="service-card__cta-icon" />
          ) : null}
        </Link>
      </div>
    </article>
  );
}
