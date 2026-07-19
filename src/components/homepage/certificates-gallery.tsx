"use client";

import { useState } from "react";

import { CertificateCard } from "@/components/homepage/certificate-card";
import { CertificateLightbox } from "@/components/homepage/certificate-lightbox";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import {
  getCertificateCardLayout,
  getCertificateCardSurface,
  partitionHomepageCertificates,
} from "@/lib/homepage/certificate-card-display";
import type { CertificateListItem } from "@/lib/certificates/types";
import { cn } from "@/lib/utils/cn";

type CertificatesGalleryProps = {
  certificates: CertificateListItem[];
};

export function CertificatesGallery({ certificates }: CertificatesGalleryProps) {
  const [activeCertificate, setActiveCertificate] =
    useState<CertificateListItem | null>(null);

  const { featured, secondary } = partitionHomepageCertificates(certificates);
  const count = certificates.length;

  return (
    <>
      <ul
        className={cn(
          "certificates-section__grid",
          `certificates-section__grid--count-${count}`
        )}
      >
        <li className="certificates-section__item certificates-section__item--featured">
          <HomepageReveal delayMs={80} className="h-full">
            <CertificateCard
              certificate={featured}
              layout={getCertificateCardLayout(0)}
              surface={getCertificateCardSurface(0)}
              onOpen={setActiveCertificate}
            />
          </HomepageReveal>
        </li>

        {secondary.map((certificate, index) => (
          <li
            key={certificate.id}
            className={cn(
              "certificates-section__item",
              "certificates-section__item--compact",
              `certificates-section__item--compact-${index + 1}`
            )}
          >
            <HomepageReveal delayMs={120 + index * 90} className="h-full">
              <CertificateCard
                certificate={certificate}
                layout={getCertificateCardLayout(index + 1)}
                surface={getCertificateCardSurface(index + 1)}
                onOpen={setActiveCertificate}
              />
            </HomepageReveal>
          </li>
        ))}
      </ul>

      <CertificateLightbox
        certificate={activeCertificate}
        open={activeCertificate !== null}
        onClose={() => setActiveCertificate(null)}
      />
    </>
  );
}
