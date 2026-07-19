import Image from "next/image";

import { formatCertificateYear } from "@/lib/certificates/format";
import type { CertificateListItem } from "@/lib/certificates/types";
import { cn } from "@/lib/utils/cn";

type CertificateCardProps = {
  certificate: CertificateListItem;
  className?: string;
};

export function CertificateCard({ certificate, className }: CertificateCardProps) {
  const yearLabel = formatCertificateYear(certificate.year);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-cream)]">
        {certificate.mediaPreview?.url ? (
          <Image
            src={certificate.mediaPreview.url}
            alt={certificate.mediaPreview.alt || certificate.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-3"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--color-text-muted)]">
            {certificate.title}
          </div>
        )}
      </div>
      <div className="space-y-1 p-4 text-center">
        <h3 className="text-card-title line-clamp-2">{certificate.title}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">{certificate.organization}</p>
        {yearLabel ? (
          <p className="text-caption text-[var(--color-secondary)]">שנת {yearLabel}</p>
        ) : null}
      </div>
    </article>
  );
}
