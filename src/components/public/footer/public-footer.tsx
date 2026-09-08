import Link from "next/link";
import { MultilineText } from "@/components/ui/multiline-text";
import { Feather, Mail, MapPin, Phone } from "lucide-react";

import { PublicLogo } from "@/components/public/header/public-logo";
import { Container } from "@/components/public/layout/container";
import {
  PUBLIC_FOOTER_NAV,
  type PublicNavLink,
} from "@/constants/public-navigation";
import { WEEKDAYS } from "@/lib/settings/constants";
import type { BusinessProfileData } from "@/lib/validations/site-settings";
import type { WebsiteSettingsPublic } from "@/lib/public/types";

const FOOTER_INFO_HREFS = new Set(["/contact", "/privacy-policy", "/terms"]);

function FooterNavColumn({
  links,
  ariaLabel,
}: {
  links: PublicNavLink[];
  ariaLabel: string;
}) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="public-focus-ring rounded-[var(--radius-sm)] text-sm text-[var(--color-text-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--color-primary)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type FooterCredit = {
  role: string;
  name: string;
  contacts: { label: string; href: string }[];
};

const FOOTER_CREDITS: FooterCredit[] = [
  {
    role: "קופי ומיקרו קופי",
    name: "לאה יעקבי",
    contacts: [
      { label: "052-717-1680", href: "tel:0527171680" },
      { label: "leahcopywriting@gmail.com", href: "mailto:leahcopywriting@gmail.com" },
    ],
  },
  {
    role: "אפיון, עיצוב ופיתוח",
    name: "לאה",
    contacts: [
      { label: "lea0556769466@gmail.com", href: "mailto:lea0556769466@gmail.com" },
    ],
  },
];

function FooterCreditLine({ role, name, contacts }: FooterCredit) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      <Feather
        aria-hidden="true"
        className="size-4 shrink-0 text-[var(--color-secondary)]"
      />
      <span>{role}:</span>
      <span className="font-medium text-[var(--color-text)]">{name}</span>
      {contacts.map((contact) => (
        <span key={contact.href} className="inline-flex items-center gap-x-2">
          <span aria-hidden="true" className="text-[var(--color-border-strong)]">
            ·
          </span>
          <a
            href={contact.href}
            className="public-focus-ring rounded-[var(--radius-sm)] hover:text-[var(--color-primary)]"
          >
            {contact.label}
          </a>
        </span>
      ))}
    </p>
  );
}

function formatWorkingHours(businessProfile: BusinessProfileData): string[] {
  if (businessProfile.working_hours.length === 0) {
    return [];
  }

  const dayLabels = new Map(
    WEEKDAYS.map((day) => [day.value, day.label] as const)
  );

  return businessProfile.working_hours.map((entry) => {
    const dayLabel = dayLabels.get(entry.day) ?? entry.day;

    return `${dayLabel}: ${entry.opens}–${entry.closes}`;
  });
}

type PublicFooterProps = {
  settings: WebsiteSettingsPublic;
  navLinks?: PublicNavLink[];
};

export function PublicFooter({
  settings,
  navLinks = PUBLIC_FOOTER_NAV,
}: PublicFooterProps) {
  const { businessProfile } = settings;
  const currentYear = new Date().getFullYear();
  const workingHours = formatWorkingHours(businessProfile);
  const primaryNavLinks = navLinks.filter(
    (link) => !FOOTER_INFO_HREFS.has(link.href)
  );
  const infoNavLinks = navLinks.filter((link) =>
    FOOTER_INFO_HREFS.has(link.href)
  );

  const whatsapp = businessProfile.social.whatsapp;
  const addressLine = [businessProfile.address, businessProfile.city]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/80">
      <Container className="py-[var(--spacing-3xl)]">
        <div className="grid gap-y-10 md:grid-cols-2 md:gap-x-12 lg:grid-cols-4">
          <div className="space-y-4">
            <PublicLogo settings={settings} />
            {businessProfile.short_description ? (
              <MultilineText as="p" className="text-muted max-w-xs">
                {businessProfile.short_description}
              </MultilineText>
            ) : null}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">
              יצירת קשר
            </h2>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              {businessProfile.phone ? (
                <li>
                  <a
                    href={`tel:${businessProfile.phone.replace(/\s/g, "")}`}
                    className="public-focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] hover:text-[var(--color-primary)]"
                  >
                    <Phone aria-hidden="true" className="size-4 shrink-0" />
                    <span>{businessProfile.phone}</span>
                  </a>
                </li>
              ) : null}
              {businessProfile.email ? (
                <li>
                  <a
                    href={`mailto:${businessProfile.email}`}
                    className="public-focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] hover:text-[var(--color-primary)]"
                  >
                    <Mail aria-hidden="true" className="size-4 shrink-0" />
                    <span>{businessProfile.email}</span>
                  </a>
                </li>
              ) : null}
              {addressLine ? (
                <li className="inline-flex items-start gap-2">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>{addressLine}</span>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <a
                    href={
                      whatsapp.startsWith("http")
                        ? whatsapp
                        : `https://wa.me/${whatsapp.replace(/\D/g, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] hover:text-[var(--color-primary)]"
                  >
                    <Phone aria-hidden="true" className="size-4 shrink-0" />
                    <span>וואטסאפ</span>
                  </a>
                </li>
              ) : null}
            </ul>
            {workingHours.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[var(--color-primary)]">
                  שעות פעילות
                </h3>
                <ul className="space-y-1 text-sm text-[var(--color-text-muted)]">
                  {workingHours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">
              ניווט
            </h2>
            <FooterNavColumn
              links={primaryNavLinks}
              ariaLabel="ניווט בתחתית האתר"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">
              מידע וקשר
            </h2>
            <FooterNavColumn
              links={infoNavLinks}
              ariaLabel="מידע ויצירת קשר"
            />
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
          <p>
            © {currentYear} {businessProfile.business_name}. כל הזכויות שמורות.
          </p>
          <div className="mt-4 flex flex-col items-center gap-1.5">
            {FOOTER_CREDITS.map((credit) => (
              <FooterCreditLine key={credit.role} {...credit} />
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
