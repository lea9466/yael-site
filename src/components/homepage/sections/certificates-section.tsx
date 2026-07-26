import { CertificatesGallery } from "@/components/homepage/certificates-gallery";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import type { CertificateListItem } from "@/lib/certificates/types";

type CertificatesSectionProps = {
  certificates: CertificateListItem[];
};

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  if (certificates.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="homepage-certificates-title"
      className="certificates-section"
    >
      <div className="certificates-section__inner">
        <HomepageReveal>
          <PublicSectionHeader
            className="certificates-section__header"
            titleId="homepage-certificates-title"
            eyebrow="הסמכות"
            title="תעודות והכשרות"
            description="מקצועיות, ידע וניסיון — בבסיס כל ליווי."
            actionLabel="לכל התעודות"
            actionHref="/about#certificates"
          />
        </HomepageReveal>

        <CertificatesGallery certificates={certificates} />
      </div>
    </section>
  );
}
