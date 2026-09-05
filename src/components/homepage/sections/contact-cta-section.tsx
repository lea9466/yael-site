import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import {
  buildBusinessWhatsAppHref,
  buildTelHref,
} from "@/lib/contact-messages/format";
import type { HomepageData } from "@/lib/validations/homepage-hero";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

type ContactCtaSectionProps = {
  content: HomepageData["contact_cta"];
  settings: WebsiteSettingsPublic;
};

export function ContactCtaSection({ content, settings }: ContactCtaSectionProps) {
  const phone = settings.businessProfile.phone?.trim() ?? "";
  const whatsapp = settings.businessProfile.social.whatsapp?.trim() ?? "";
  const phoneHref = phone ? buildTelHref(phone) : null;
  const whatsappHref = whatsapp ? buildBusinessWhatsAppHref(whatsapp) : null;

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
              {/* Title + button label are fixed in code — the homepage
                  contact CTA has no CMS editor. Only the body text is
                  content-driven. */}
              <h2
                id="homepage-contact-cta-title"
                className="contact-cta-section__title"
              >
                טוב להיות בקשר
              </h2>
              <p className="contact-cta-section__text">{content.text}</p>
            </div>

            <div className="contact-cta-section__actions">
              <Link
                href="/contact"
                className="contact-cta-section__primary public-focus-ring"
              >
                מכאן מתחברים
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

              {whatsappHref ? (
                <a
                  href={whatsappHref}
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
