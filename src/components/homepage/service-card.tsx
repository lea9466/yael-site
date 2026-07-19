import Image from "next/image";
import Link from "next/link";

import { SectionCTA } from "@/components/homepage/section-cta";
import type { PublicServiceSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type ServiceCardProps = {
  service: PublicServiceSummary;
  className?: string;
};

export function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <Link
        href={`/services/${service.slug}`}
        className="public-focus-ring relative block aspect-[4/3] overflow-hidden bg-[var(--color-surface-soft)]"
      >
        {service.coverUrl ? (
          <Image
            src={service.coverUrl}
            alt={service.coverAlt ?? service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[var(--transition-slow)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--color-light-sage-soft)_0%,var(--color-cream)_100%)] px-4 text-center text-sm text-[var(--color-text-muted)]">
            {service.title}
          </div>
        )}
        {service.featured ? (
          <span className="status-badge absolute start-3 top-3" data-size="sm" data-variant="featured">
            <span className="status-badge-label">מומלץ</span>
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <h3 className="text-card-title line-clamp-2">
            <Link
              href={`/services/${service.slug}`}
              className="public-focus-ring rounded-[var(--radius-sm)] transition-colors hover:text-[var(--color-primary)]"
            >
              {service.title}
            </Link>
          </h3>
          <p className="text-muted line-clamp-3 text-sm">{service.short_description}</p>
        </div>
        <div className="mt-auto pt-1">
          <SectionCTA
            label="לפרטים"
            href={`/services/${service.slug}`}
            variant="ghost"
            className="min-h-0 px-0"
          />
        </div>
      </div>
    </article>
  );
}
