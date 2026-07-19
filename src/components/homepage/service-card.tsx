import Image from "next/image";
import Link from "next/link";

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
  className?: string;
};

const surfaceClasses: Record<ServiceCardSurface, string> = {
  white: "service-card--white",
  sage: "service-card--sage",
  cream: "service-card--cream",
};

export function ServiceCard({
  service,
  surface = "white",
  isPrimaryFeatured = false,
  className,
}: ServiceCardProps) {
  const badge = getServiceCardBadge(service, isPrimaryFeatured);
  const href = `/services/${service.slug}`;

  return (
    <article
      className={cn(
        "service-card group",
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

      <Link
        href={href}
        className="service-card__media public-focus-ring"
        aria-label={service.title}
      >
        {service.coverUrl ? (
          <Image
            src={service.coverUrl}
            alt={service.coverAlt ?? service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="service-card__image"
          />
        ) : (
          <div className="service-card__media-fallback">{service.title}</div>
        )}
      </Link>

      <div className="service-card__body">
        <div className="service-card__copy">
          <h3 className="service-card__title">
            <Link href={href} className="public-focus-ring rounded-[var(--radius-sm)]">
              {service.title}
            </Link>
          </h3>
          <MultilineText as="p" className="service-card__description">
            {service.short_description}
          </MultilineText>
        </div>

        <Link href={href} className="hero-btn hero-btn--secondary service-card__cta public-focus-ring">
          לפרטים
        </Link>
      </div>
    </article>
  );
}
