import { CertificateCard } from "@/components/homepage/certificate-card";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { Container } from "@/components/public/layout/container";
import { Section } from "@/components/public/layout/section";
import type { CertificateListItem } from "@/lib/certificates/types";

type CertificatesSectionProps = {
  certificates: CertificateListItem[];
};

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  if (certificates.length === 0) {
    return null;
  }

  return (
    <Section ariaLabelledBy="homepage-certificates-title">
      <Container className="space-y-10">
        <PublicSectionHeader
          eyebrow="הסמכות"
          title="תעודות והכשרות"
          description="מקצועיות, ידע וניסיון — בבסיס כל ליווי."
          actionLabel="כל התעודות"
          actionHref="/certificates"
          titleId="homepage-certificates-title"
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <li key={certificate.id}>
              <CertificateCard certificate={certificate} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
