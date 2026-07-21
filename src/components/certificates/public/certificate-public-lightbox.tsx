"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, FileImage } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";

type CertificatePublicLightboxProps = {
  certificates: CertificateListItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

function buildCertificateAlt(title: string, organization: string): string {
  return `תעודה: ${title}, ${organization}`;
}

export function CertificatePublicLightbox({
  certificates,
  activeIndex,
  onClose,
  onNavigate,
}: CertificatePublicLightboxProps) {
  const open = activeIndex !== null;
  const certificate =
    activeIndex !== null ? (certificates[activeIndex] ?? null) : null;
  const total = certificates.length;
  const canNavigate = total > 1;

  useEffect(() => {
    if (!open || !canNavigate || activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate((activeIndex + 1) % total);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate((activeIndex - 1 + total) % total);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, canNavigate, activeIndex, total, onNavigate]);

  if (!certificate) {
    return null;
  }

  const yearLabel = formatCertificateYear(certificate.year);
  const description = certificate.description?.trim() ?? "";
  const hasDescription = description.length > 0;
  const mediaUrl = certificate.mediaPreview?.url?.trim() ?? "";
  const hasMedia = mediaUrl.length > 0;
  const alt = buildCertificateAlt(certificate.title, certificate.organization);
  const subtitleParts = [
    certificate.organization,
    yearLabel ? `שנת ${yearLabel}` : null,
  ].filter(Boolean);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={certificate.title}
      description={subtitleParts.join(" · ") || undefined}
      panelClassName="certificate-lightbox__panel"
      bodyClassName="certificate-lightbox__body"
    >
      <div className="flex w-full flex-col gap-4">
        {canNavigate ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="public-focus-ring inline-flex size-10 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] transition-[transform,background-color] duration-[var(--transition-base)] hover:bg-[var(--color-light-sage-soft)]"
              onClick={() => onNavigate((activeIndex! + 1) % total)}
              aria-label="התעודה הבאה"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <p
              className="text-caption font-medium text-[var(--color-text-muted)]"
              aria-live="polite"
            >
              {activeIndex! + 1} / {total}
            </p>
            <button
              type="button"
              className="public-focus-ring inline-flex size-10 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] transition-[transform,background-color] duration-[var(--transition-base)] hover:bg-[var(--color-light-sage-soft)]"
              onClick={() => onNavigate((activeIndex! - 1 + total) % total)}
              aria-label="התעודה הקודמת"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        ) : null}

        <div className="certificate-lightbox__stage">
          {hasMedia ? (
            <Image
              src={mediaUrl}
              alt={alt}
              width={1400}
              height={1800}
              className="certificate-lightbox__image"
              sizes="(max-width: 768px) 94vw, min(80vw, 52rem)"
              priority
            />
          ) : (
            <div className="certificate-lightbox__fallback">
              <FileImage
                aria-hidden="true"
                className="certificate-lightbox__fallback-icon"
              />
              <p>{certificate.title}</p>
            </div>
          )}
        </div>

        {hasDescription ? (
          <p className="text-center text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
