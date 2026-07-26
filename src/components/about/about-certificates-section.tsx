"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";

import { CertificatePublicCard } from "@/components/certificates/public/certificate-public-card";
import { CertificatePublicLightbox } from "@/components/certificates/public/certificate-public-lightbox";
import { sortCertificatesForDisplay } from "@/components/certificates/public/sort-certificates-for-display";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { getCertificateCardSurface } from "@/lib/homepage/certificate-card-display";
import type { CertificateListItem } from "@/lib/certificates/types";

type AboutCertificatesSectionProps = {
  items: CertificateListItem[];
  isPreview?: boolean;
};

export function AboutCertificatesSection({
  items,
  isPreview = false,
}: AboutCertificatesSectionProps) {
  const certificates = sortCertificatesForDisplay(items);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (certificates.length === 0) {
    if (!isPreview) {
      return null;
    }

    return (
      <section
        id="certificates"
        className="about-page__certificates"
        aria-labelledby="about-certificates-heading"
      >
        <div className="about-page__container">
          <p className="about-page__empty-note">טרם נוספו תעודות להצגה</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="certificates"
      className="about-page__certificates"
      aria-labelledby="about-certificates-heading"
    >
      <div className="about-page__container">
        <HomepageReveal>
          <header className="about-page__certificates-head">
            <p className="about-page__eyebrow">
              <GraduationCap
                aria-hidden="true"
                className="about-page__eyebrow-icon"
              />
              הכשרה וניסיון מקצועי
            </p>
            <h2
              id="about-certificates-heading"
              className="about-page__certificates-title"
            >
              תעודות והסמכות
            </h2>
            <p className="about-page__certificates-text">
              הכשרות, לימודים והסמכות מקצועיות — תשתית הידע שמלווה את הליווי
              התזונתי ואת הגישה לאכילה מחוברת.
            </p>
          </header>
        </HomepageReveal>

        <ul className="about-page__certificates-grid">
          {certificates.map((certificate, index) => (
            <li key={certificate.id}>
              <HomepageReveal delayMs={Math.min(index * 60, 240)}>
                <CertificatePublicCard
                  certificate={certificate}
                  surface={getCertificateCardSurface(index)}
                  priority={false}
                  onOpen={() => setActiveIndex(index)}
                />
              </HomepageReveal>
            </li>
          ))}
        </ul>
      </div>

      <CertificatePublicLightbox
        certificates={certificates}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </section>
  );
}
