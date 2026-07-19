"use client";

import Image from "next/image";
import { Award } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";

type CertificateLightboxProps = {
  certificate: CertificateListItem | null;
  open: boolean;
  onClose: () => void;
};

export function CertificateLightbox({
  certificate,
  open,
  onClose,
}: CertificateLightboxProps) {
  if (!certificate) {
    return null;
  }

  const yearLabel = formatCertificateYear(certificate.year);
  const alt = certificate.mediaPreview?.alt || certificate.title;
  const description = [
    certificate.organization,
    yearLabel ? `שנת ${yearLabel}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={certificate.title}
      description={description || undefined}
      panelClassName="certificate-lightbox__panel"
      bodyClassName="certificate-lightbox__body"
    >
      <div className="certificate-lightbox__stage">
        {certificate.mediaPreview?.url ? (
          <Image
            src={certificate.mediaPreview.url}
            alt={alt}
            width={1200}
            height={1600}
            className="certificate-lightbox__image"
            sizes="(max-width: 768px) 92vw, min(72vw, 52rem)"
          />
        ) : (
          <div className="certificate-lightbox__fallback">
            <Award aria-hidden="true" className="certificate-lightbox__fallback-icon" />
            <p>{certificate.title}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
