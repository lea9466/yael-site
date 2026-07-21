import { Mail, MessageCircle, Phone } from "lucide-react";

import type { PublicContactLinks } from "@/lib/contact/public-links";

type ContactDirectCtaProps = {
  links: PublicContactLinks;
};

export function ContactDirectCta({ links }: ContactDirectCtaProps) {
  const actions = [
    links.whatsappHref
      ? {
          key: "whatsapp",
          href: links.whatsappHref,
          label: "וואטסאפ",
          icon: MessageCircle,
          external: true,
        }
      : null,
    links.phoneHref
      ? {
          key: "phone",
          href: links.phoneHref,
          label: "טלפון",
          icon: Phone,
          external: false,
        }
      : null,
    links.emailHref
      ? {
          key: "email",
          href: links.emailHref,
          label: "אימייל",
          icon: Mail,
          external: false,
        }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  if (actions.length === 0) {
    return null;
  }

  return (
    <section
      className="contact-page__direct"
      aria-labelledby="contact-direct-title"
    >
      <div className="contact-page__direct-inner">
        <div className="contact-page__direct-panel">
          <div aria-hidden="true" className="contact-page__direct-glow" />
          <h2 id="contact-direct-title" className="contact-page__direct-title">
            מעדיפים לפנות ישירות?
          </h2>
          <p className="contact-page__direct-text">
            אפשר גם ליצור קשר בדרך שנוחה לכם — בלי למלא טופס.
          </p>
          <div className="contact-page__direct-actions">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <a
                  key={action.key}
                  href={action.href}
                  className="contact-page__direct-button public-focus-ring"
                  {...(action.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {action.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
