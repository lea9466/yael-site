"use client";

import Image from "next/image";
import { FileImage } from "lucide-react";

import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";
import type { CertificateCardSurface } from "@/lib/homepage/certificate-card-display";
import { cn } from "@/lib/utils/cn";

type CertificatePublicCardProps = {
  certificate: CertificateListItem;
  surface?: CertificateCardSurface;
  priority?: boolean;
  onOpen: () => void;
};

function buildCertificateAlt(title: string, organization: string): string {
  return `תעודה: ${title}, ${organization}`;
}

export function CertificatePublicCard({
  certificate,
  surface = "ivory",
  priority = false,
  onOpen,
}: CertificatePublicCardProps) {
  const yearLabel = formatCertificateYear(certificate.year);
  const description = certificate.description?.trim() ?? "";
  const hasDescription = description.length > 0;
  const mediaUrl = certificate.mediaPreview?.url?.trim() ?? "";
  const hasMedia = mediaUrl.length > 0;
  const cardTitle = certificate.card_title?.trim() || certificate.title;
  const alt = buildCertificateAlt(certificate.title, certificate.organization);

  return (
    <article
      className={cn("certificate-card group", `certificate-card--${surface}`)}
    >
      <button
        type="button"
        className="certificate-card__trigger public-focus-ring"
        onClick={onOpen}
        aria-label={`פתיחת תעודה: ${cardTitle}`}
      >
        <div className="certificate-card__media">
          <div className="certificate-card__frame">
            {hasMedia ? (
              <Image
                src={mediaUrl}
                alt={alt}
                fill
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="certificate-card__image"
              />
            ) : (
              <div className="certificate-card__media-fallback">
                <FileImage
                  aria-hidden="true"
                  className="certificate-card__fallback-icon"
                />
                <span className="sr-only">{certificate.title}</span>
              </div>
            )}
          </div>
        </div>

        <div className="certificate-card__content">
          {yearLabel ? (
            <p className="certificate-card__year">{yearLabel}</p>
          ) : null}
          <h3 className="certificate-card__title">{cardTitle}</h3>
          <p className="certificate-card__organization">
            {certificate.organization}
          </p>
          {hasDescription ? (
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </button>
    </article>
  );
}
