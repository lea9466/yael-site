import Link from "next/link";
import { MultilineText } from "@/components/ui/multiline-text";
import type { LucideIcon } from "lucide-react";
import {
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";

import { PublicLogo } from "@/components/public/header/public-logo";
import { Container } from "@/components/public/layout/container";
import {
  PUBLIC_FOOTER_NAV,
  type PublicNavLink,
} from "@/constants/public-navigation";
import { WEEKDAYS } from "@/lib/settings/constants";
import type { BusinessProfileData } from "@/lib/validations/site-settings";
import type { WebsiteSettingsPublic } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type SocialKey = keyof BusinessProfileData["social"];

type SocialLinkConfig = {
  key: SocialKey;
  label: string;
  icon: LucideIcon;
};

const SOCIAL_LINKS: SocialLinkConfig[] = [
  { key: "instagram", label: "אינסטגרם", icon: Share2 },
  { key: "facebook", label: "פייסבוק", icon: Share2 },
  { key: "youtube", label: "יוטיוב", icon: Share2 },
  { key: "linkedin", label: "לינקדאין", icon: Share2 },
  { key: "tiktok", label: "טיקטוק", icon: Globe },
  { key: "pinterest", label: "פינטרסט", icon: Globe },
];

function FooterNavColumn({ links }: { links: PublicNavLink[] }) {
  return (
    <nav aria-label="קישורי תחתית">
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

  const availableSocialLinks = SOCIAL_LINKS.flatMap((social) => {
    const href = businessProfile.social[social.key];

    if (!href) {
      return [];
    }

    return [{ ...social, href }];
  });

  const whatsapp = businessProfile.social.whatsapp;
  const addressLine = [businessProfile.address, businessProfile.city]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/80">
      <Container className="py-[var(--spacing-3xl)]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
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
            <FooterNavColumn links={navLinks} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">
              רשתות חברתיות
            </h2>
            {availableSocialLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {availableSocialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className={cn(
                          "public-focus-ring inline-flex size-10 items-center justify-center rounded-[var(--radius-full)]",
                          "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]",
                          "transition-[transform,background-color] duration-[var(--transition-fast)] hover:-translate-y-0.5 hover:bg-[var(--color-light-sage-soft)]"
                        )}
                      >
                        <Icon aria-hidden className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                עקבו אחרי העדכונים בקרוב.
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
          <p>
            © {currentYear} {businessProfile.business_name}. כל הזכויות שמורות.
          </p>
        </div>
      </Container>
    </footer>
  );
}
