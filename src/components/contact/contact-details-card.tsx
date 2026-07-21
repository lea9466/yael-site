import Link from "next/link";
import { MessageCircle } from "lucide-react";

import {
  CONTACT_DETAIL_ICONS,
  type PublicContactLinks,
} from "@/lib/contact/public-links";

type ContactDetailsCardProps = {
  links: PublicContactLinks;
};

export function ContactDetailsCard({
  links,
}: ContactDetailsCardProps) {
  if (links.items.length === 0) {
    return null;
  }

  return (
    <aside className="contact-page__details" aria-labelledby="contact-details-title">
      <div className="contact-page__details-card">
        <div aria-hidden="true" className="contact-page__details-shape contact-page__details-shape--one" />
        <div aria-hidden="true" className="contact-page__details-shape contact-page__details-shape--two" />

        <div className="contact-page__details-inner">
          <p className="contact-page__details-eyebrow">פרטי קשר</p>
          <h2 id="contact-details-title" className="contact-page__details-title">
            אפשר גם לפנות ישירות
          </h2>
          <p className="contact-page__details-text">
            אם נוח לכם יותר בטלפון או באימייל — הפרטים שלי כאן.
          </p>

          <ul className="contact-page__details-list">
            {links.items.map((item) => {
              const Icon = CONTACT_DETAIL_ICONS[item.icon];
              const content = (
                <>
                  <span className="contact-page__details-icon" aria-hidden="true">
                    <Icon className="size-4" />
                  </span>
                  <span className="contact-page__details-copy">
                    <span className="contact-page__details-label">{item.label}</span>
                    <span className="contact-page__details-value">
                      {item.value.split("\n").map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={item.key} className="contact-page__details-item">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="contact-page__details-link public-focus-ring"
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="contact-page__details-static">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>

          {links.whatsappHref ? (
            <a
              href={links.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-page__details-whatsapp public-focus-ring"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              שליחת הודעה בוואטסאפ
            </a>
          ) : null}

          {links.phoneHref && !links.whatsappHref ? (
            <Link
              href={links.phoneHref}
              className="contact-page__details-whatsapp public-focus-ring"
            >
              התקשרות עכשיו
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
