import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

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
  const phone = settings.businessProfile.phone?.trim() ?? "";
  const whatsapp = settings.businessProfile.social.whatsapp?.trim() ?? "";
  const phoneHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  return (
    <section
      aria-labelledby="homepage-contact-cta-title"
      className="contact-cta-section"
    >
      <div className="contact-cta-section__inner">
        <div className="contact-cta-section__panel">
          <div aria-hidden="true" className="contact-cta-section__glow contact-cta-section__glow--start" />
          <div aria-hidden="true" className="contact-cta-section__glow contact-cta-section__glow--end" />
          <div aria-hidden="true" className="contact-cta-section__shape contact-cta-section__shape--one" />
          <div aria-hidden="true" className="contact-cta-section__shape contact-cta-section__shape--two" />

          <div className="contact-cta-section__layout">
            <div className="contact-cta-section__copy">
              <h2
                id="homepage-contact-cta-title"
                className="contact-cta-section__title"
              >
                {content.title}
              </h2>
              <p className="contact-cta-section__text">{content.text}</p>
            </div>

            <div className="contact-cta-section__actions">
              <Link
                href="/contact"
                className="contact-cta-section__primary public-focus-ring"
              >
                {content.button_label}
              </Link>

              {phoneHref ? (
                <Link
                  href={phoneHref}
                  className="contact-cta-section__secondary public-focus-ring"
                >
                  <Phone aria-hidden="true" className="contact-cta-section__action-icon" />
                  <span>{phone}</span>
                </Link>
              ) : null}

              {whatsapp ? (
                <a
                  href={buildWhatsAppHref(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-cta-section__secondary public-focus-ring"
                >
                  <MessageCircle
                    aria-hidden="true"
                    className="contact-cta-section__action-icon"
                  />
                  <span>וואטסאפ</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
