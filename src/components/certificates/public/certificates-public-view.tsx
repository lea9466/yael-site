"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap } from "lucide-react";

import { CertificatePublicCard } from "@/components/certificates/public/certificate-public-card";
import { CertificatePublicLightbox } from "@/components/certificates/public/certificate-public-lightbox";
import { sortCertificatesForDisplay } from "@/components/certificates/public/sort-certificates-for-display";
import { PublicEmptyState } from "@/components/public/states/public-empty-state";
import { getCertificateCardSurface } from "@/lib/homepage/certificate-card-display";
import type { CertificateListItem } from "@/lib/certificates/types";

type CertificatesPublicViewProps = {
  items: CertificateListItem[];
};

export function CertificatesPublicView({ items }: CertificatesPublicViewProps) {
  const certificates = sortCertificatesForDisplay(items);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isEmpty = certificates.length === 0;

  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 py-12 md:px-20 md:py-16">
      <header className="mb-10 max-w-2xl space-y-3">
        <p className="text-caption font-medium tracking-wide text-[var(--color-secondary)]">
          הכשרה וניסיון מקצועי
        </p>
        <h1 className="text-page-title">תעודות והסמכות</h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          כאן מרוכזות הכשרות, לימודים והסמכות מקצועיות — תשתית הידע שמלווה את
          הליווי התזונתי ואת הגישה לאכילה מחוברת.
        </p>
      </header>

      {isEmpty ? (
        <PublicEmptyState
          icon={GraduationCap}
          title="התעודות יופיעו כאן בקרוב"
          description="בקרוב תוכלו לעיין כאן בהכשרות ובהסמכות המקצועיות."
        />
      ) : (
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => (
            <li key={certificate.id}>
              <CertificatePublicCard
                certificate={certificate}
                surface={getCertificateCardSurface(index)}
                priority={index === 0}
                onOpen={() => setActiveIndex(index)}
              />
            </li>
          ))}
        </ul>
      )}

      {!isEmpty ? (
        <section
          aria-labelledby="certificates-cta-title"
          className="mt-12 pt-[var(--spacing-section)] sm:mt-16"
        >
          <div className="surface-card-elevated relative overflow-hidden rounded-[var(--radius-xl)] px-6 py-10 sm:px-10 sm:py-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -start-16 -top-16 size-48 rounded-full bg-[var(--color-light-sage-soft)] blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -end-10 size-56 rounded-full bg-[var(--color-coral-soft)] blur-2xl"
            />
            <div className="relative z-[var(--z-page)] mx-auto max-w-2xl space-y-5 text-center">
              <h2 id="certificates-cta-title" className="text-section-title">
                ידע מקצועי שמתחבר לליווי אישי
              </h2>
              <p className="text-muted text-base sm:text-lg">
                ההכשרה המקצועית היא הבסיס — והליווי עצמו מותאם אישית, בקצב
                ובצורה שמתאימים לכל אחת.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/services"
                  className="public-focus-ring inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-warm)] px-6 text-sm font-medium text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                >
                  לעמוד השירותים
                </Link>
                <Link
                  href="/contact"
                  className="public-focus-ring inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-6 text-sm font-medium text-[var(--color-primary)] transition-[transform,background-color] duration-[var(--transition-base)] hover:bg-[var(--color-light-sage-soft)]"
                >
                  יצירת קשר
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <CertificatePublicLightbox
        certificates={certificates}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </div>
  );
}
