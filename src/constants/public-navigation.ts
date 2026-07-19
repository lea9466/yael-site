export type PublicNavLink = {
  label: string;
  href: string;
};

export const PUBLIC_PRIMARY_NAV: PublicNavLink[] = [
  { label: "אודות", href: "/about" },
  { label: "שירותים", href: "/services" },
  { label: "מתכונים", href: "/recipes" },
  { label: "מאמרים", href: "/articles" },
  { label: "המלצות", href: "/testimonials" },
];

export const PUBLIC_FOOTER_NAV: PublicNavLink[] = [
  ...PUBLIC_PRIMARY_NAV,
  { label: "תעודות והסמכות", href: "/certificates" },
  { label: "יצירת קשר", href: "/contact" },
  { label: "מדיניות פרטיות", href: "/privacy" },
  { label: "תנאי שימוש", href: "/terms" },
];

export const PUBLIC_CTA = {
  label: "יצירת קשר",
  href: "/contact",
} as const;

export const PUBLIC_STATIC_ROUTES: PublicNavLink[] = [
  { label: "דף הבית", href: "/" },
  ...PUBLIC_FOOTER_NAV,
];
