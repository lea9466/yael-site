import Link from "next/link";

import { CertificateCard } from "@/components/homepage/certificate-card";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import {
  getCertificateCardLayout,
  getCertificateCardSurface,
} from "@/lib/homepage/certificate-card-display";
import type { CertificateListItem } from "@/lib/certificates/types";

type CertificatesSectionProps = {
  certificates: CertificateListItem[];
};

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  if (certificates.length === 0) {
    return null;
  }

  const [featuredCertificate, ...secondaryCertificates] = certificates;

  return (
    <section
      aria-labelledby="homepage-certificates-title"
      className="certificates-section"
    >
      <div className="certificates-section__inner">
        <HomepageReveal>
          <header className="certificates-section__header">
            <p className="certificates-section__eyebrow">הסמכות</p>
            <h2
              id="homepage-certificates-title"
              className="certificates-section__title"
            >
              תעודות והכשרות
            </h2>
            <p className="certificates-section__description">
              מקצועיות, ידע וניסיון — בבסיס כל ליווי.
            </p>
            <Link
              href="/certificates"
              className="certificates-section__action public-focus-ring"
            >
              כל התעודות
            </Link>
          </header>
        </HomepageReveal>

        <div
          className={
            secondaryCertificates.length > 0
              ? "certificates-section__composition"
              : "certificates-section__composition certificates-section__composition--single"
          }
        >
          <HomepageReveal delayMs={80} className="certificates-section__featured">
            <CertificateCard
              certificate={featuredCertificate}
              layout={getCertificateCardLayout(0)}
              surface={getCertificateCardSurface(0)}
            />
          </HomepageReveal>

          {secondaryCertificates.length > 0 ? (
            <ul className="certificates-section__sidebar">
              {secondaryCertificates.map((certificate, index) => {
                const cardIndex = index + 1;

                return (
                  <li key={certificate.id} className="certificates-section__sidebar-item">
                    <HomepageReveal delayMs={120 + index * 90}>
                      <CertificateCard
                        certificate={certificate}
                        layout={getCertificateCardLayout(cardIndex)}
                        surface={getCertificateCardSurface(cardIndex)}
                      />
                    </HomepageReveal>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
