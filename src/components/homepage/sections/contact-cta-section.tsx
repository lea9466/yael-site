import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { OrganicDecoration } from "@/components/homepage/organic-decoration";
import { SectionCTA } from "@/components/homepage/section-cta";
import { Container } from "@/components/public/layout/container";
import { Section } from "@/components/public/layout/section";
import type { HomepageData } from "@/lib/validations/homepage-hero";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

type ContactCtaSectionProps = {
  content: HomepageData["contact_cta"];
  settings: WebsiteSettingsPublic;
};

function buildWhatsAppHref(value: string): string {
  if (value.startsWith("http")) {
    return value;
  }

  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function ContactCtaSection({ content, settings }: ContactCtaSectionProps) {
  const whatsapp = settings.businessProfile.social.whatsapp;

  return (
    <Section tone="cream" ariaLabelledBy="homepage-contact-cta-title" className="relative overflow-hidden">
      <OrganicDecoration variant="coral" className="-start-10 top-0 size-56" />
      <OrganicDecoration variant="hero" className="-bottom-16 end-0 size-72" />

      <Container>
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[image:var(--gradient-warm)] px-6 py-10 text-center shadow-[var(--shadow-lg)] sm:px-10 sm:py-12">
          <div className="mx-auto max-w-2xl space-y-5">
            <h2
              id="homepage-contact-cta-title"
              className="text-section-title text-[var(--color-text-on-primary)]"
            >
              {content.title}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-text-on-primary)]/90 sm:text-lg">
              {content.text}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <SectionCTA
                label={content.button_label}
                href="/contact"
                variant="secondary"
                className="min-h-12 border-[var(--color-text-on-primary)]/30 bg-[var(--color-surface)] px-6 text-[var(--color-primary)]"
              />
              {settings.businessProfile.phone ? (
                <Link
                  href={`tel:${settings.businessProfile.phone.replace(/\s/g, "")}`}
                  className="public-focus-ring inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-text-on-primary)]/30 px-5 text-sm font-medium text-[var(--color-text-on-primary)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <Phone aria-hidden="true" className="size-4" />
                  {settings.businessProfile.phone}
                </Link>
              ) : null}
              {whatsapp ? (
                <a
                  href={buildWhatsAppHref(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="public-focus-ring inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-text-on-primary)]/30 px-5 text-sm font-medium text-[var(--color-text-on-primary)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <MessageCircle aria-hidden="true" className="size-4" />
                  וואטסאפ
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
