"use client";

import Image from "next/image";
import { FileImage } from "lucide-react";

import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";
import { cn } from "@/lib/utils/cn";

type AboutCertificateCardProps = {
  certificate: CertificateListItem;
  priority?: boolean;
  onOpen: () => void;
};

function buildCertificateAlt(title: string, organization: string): string {
  return `תעודה: ${title}, ${organization}`;
}

export function AboutCertificateCard({
  certificate,
  priority = false,
  onOpen,
}: AboutCertificateCardProps) {
  const yearLabel = formatCertificateYear(certificate.year);
  const description = certificate.description?.trim() ?? "";
  const hasDescription = description.length > 0;
  const mediaUrl = certificate.mediaPreview?.url?.trim() ?? "";
  const hasMedia = mediaUrl.length > 0;
  const cardTitle = certificate.card_title?.trim() || certificate.title;
  const alt = buildCertificateAlt(certificate.title, certificate.organization);

  return (
    <article
      className={cn(
        "admin-card group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
      )}
    >
      <button
        type="button"
        className="flex h-full flex-col items-stretch"
        onClick={onOpen}
        aria-label={`פתיחת תעודה: ${cardTitle}`}
      >
        <div className="relative aspect-[4/3] bg-[var(--color-surface-soft)]">
          {hasMedia ? (
            <Image
              src={mediaUrl}
              alt={alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--color-text-muted)]">
              <FileImage aria-hidden="true" className="size-6" />
              <span className="sr-only">{certificate.title}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-card-title" title={cardTitle}>
              {cardTitle}
            </h3>
            <p
              className="truncate text-sm text-[var(--color-text-muted)]"
              title={certificate.organization}
            >
              {certificate.organization}
            </p>
            {yearLabel ? (
              <p className="text-caption text-[var(--color-text-muted)]">
                שנת {yearLabel}
              </p>
            ) : null}
          </div>

          {hasDescription ? (
            <p className="line-clamp-3 text-sm text-[var(--color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </button>
    </article>
  );
}
