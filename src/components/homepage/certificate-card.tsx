import Image from "next/image";
import { Award } from "lucide-react";

import { PublicHighlightPill } from "@/components/homepage/public-highlight-pill";
import { MultilineText } from "@/components/ui/multiline-text";
import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";
import {
  getCertificateCardBadge,
  getCertificateCardExcerpt,
  type CertificateCardLayout,
  type CertificateCardSurface,
} from "@/lib/homepage/certificate-card-display";
import { cn } from "@/lib/utils/cn";

type CertificateCardProps = {
  certificate: CertificateListItem;
  layout?: CertificateCardLayout;
  surface?: CertificateCardSurface;
  className?: string;
};

export function CertificateCard({
  certificate,
  layout = "compact",
  surface = "cream",
  className,
}: CertificateCardProps) {
  const yearLabel = formatCertificateYear(certificate.year);
  const badge = getCertificateCardBadge(certificate);
  const excerpt =
    layout === "featured" ? getCertificateCardExcerpt(certificate) : null;
  const alt = certificate.mediaPreview?.alt || certificate.title;

  return (
    <article
      className={cn(
        "certificate-card group",
        `certificate-card--${layout}`,
        `certificate-card--${surface}`,
        className
      )}
    >
      <div className="certificate-card__media">
        {certificate.mediaPreview?.url ? (
          <Image
            src={certificate.mediaPreview.url}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 216px"
            className="certificate-card__image"
          />
        ) : (
          <div className="certificate-card__media-fallback">
            <Award aria-hidden="true" className="certificate-card__fallback-icon" />
            <span className="sr-only">{certificate.title}</span>
          </div>
        )}
      </div>

      <div className="certificate-card__content">
        {badge ? (
          <PublicHighlightPill
            label={badge.label}
            variant={badge.variant}
            floating={false}
            className="certificate-card__badge"
          />
        ) : null}

        <div className="certificate-card__copy">
          <h3 className="certificate-card__title">{certificate.title}</h3>
          <p className="certificate-card__organization">{certificate.organization}</p>
          {yearLabel ? (
            <p className="certificate-card__year">שנת {yearLabel}</p>
          ) : null}
        </div>

        {excerpt ? (
          <MultilineText as="p" className="certificate-card__excerpt">
            {excerpt}
          </MultilineText>
        ) : null}
      </div>
    </article>
  );
}
