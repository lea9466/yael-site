"use client";

import Image from "next/image";
import { Award } from "lucide-react";

import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";
import {
  getCertificateCardBadge,
  type CertificateCardLayout,
  type CertificateCardSurface,
} from "@/lib/homepage/certificate-card-display";
import { cn } from "@/lib/utils/cn";

type CertificateCardProps = {
  certificate: CertificateListItem;
  layout?: CertificateCardLayout;
  surface?: CertificateCardSurface;
  onOpen: (certificate: CertificateListItem) => void;
  className?: string;
};

export function CertificateCard({
  certificate,
  layout = "compact",
  surface = "ivory",
  onOpen,
  className,
}: CertificateCardProps) {
  const yearLabel = formatCertificateYear(certificate.year);
  const badge = getCertificateCardBadge(certificate);
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
      <button
        type="button"
        className="certificate-card__trigger public-focus-ring"
        onClick={() => onOpen(certificate)}
        aria-label={`הצגת תעודה: ${certificate.title}`}
      >
        <div className="certificate-card__media">
          <div className="certificate-card__frame">
            {certificate.mediaPreview?.url ? (
              <Image
                src={certificate.mediaPreview.url}
                alt={alt}
                fill
                sizes={
                  layout === "featured"
                    ? "(max-width: 767px) 92vw, (max-width: 1199px) 80vw, 42vw"
                    : "(max-width: 767px) 92vw, (max-width: 1199px) 44vw, 28vw"
                }
                className="certificate-card__image"
              />
            ) : (
              <div className="certificate-card__media-fallback">
                <Award
                  aria-hidden="true"
                  className="certificate-card__fallback-icon"
                />
                <span className="sr-only">{certificate.title}</span>
              </div>
            )}
          </div>
        </div>

        <div className="certificate-card__content">
          {badge ? (
            <span
              className={cn(
                "certificate-card__badge",
                `certificate-card__badge--${badge.variant}`
              )}
            >
              {badge.label}
            </span>
          ) : null}

          <h3 className="certificate-card__title">{certificate.title}</h3>
          <p className="certificate-card__organization">
            {certificate.organization}
          </p>
          {yearLabel ? (
            <p className="certificate-card__year">{yearLabel}</p>
          ) : null}
        </div>
      </button>
    </article>
  );
}
