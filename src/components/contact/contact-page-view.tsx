import { MessageCircle } from "lucide-react";

import { ContactDetailsCard } from "@/components/contact/contact-details-card";
import { ContactDirectCta } from "@/components/contact/contact-direct-cta";
import { ContactForm } from "@/components/contact/contact-form";
import type { PublicContactLinks } from "@/lib/contact/public-links";

type ContactPageViewProps = {
  links: PublicContactLinks;
};

export function ContactPageView({ links }: ContactPageViewProps) {
  return (
    <div className="contact-page">
      <div aria-hidden="true" className="contact-page__blob contact-page__blob--a" />
      <div aria-hidden="true" className="contact-page__blob contact-page__blob--b" />

      <section className="contact-page__hero" aria-labelledby="contact-hero-title">
        <div className="contact-page__hero-inner">
          <p className="contact-page__badge">
            <MessageCircle aria-hidden="true" className="contact-page__badge-icon" />
            נדבר?
          </p>
          <h1 id="contact-hero-title" className="contact-page__title">
            בואו נתחיל בשיחה
          </h1>
          <p className="contact-page__lead">
            אפשר להשאיר כאן פרטים ואחזור אליכם בהקדם — ברוגע, בבהירות ובלי לחץ.
            אם נוח לכם יותר בטלפון או באימייל, הפרטים זמינים גם כאן בעמוד.
          </p>
        </div>
      </section>

      <section
        className="contact-page__main"
        aria-label="טופס יצירת קשר ופרטי קשר"
      >
        <div className="contact-page__main-inner">
          <div className="contact-page__grid">
            <div className="contact-page__form-panel">
              <ContactForm links={links} />
            </div>
            <ContactDetailsCard links={links} />
          </div>
        </div>
      </section>

      <ContactDirectCta links={links} />
    </div>
  );
}
