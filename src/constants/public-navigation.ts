export type PublicNavLink = {
  label: string;
  href: string;
};

export const PUBLIC_PRIMARY_NAV: PublicNavLink[] = [
  { label: "בית", href: "/" },
  { label: "אודות", href: "/about" },
  { label: "שירותים", href: "/services" },
  { label: "מתכונים", href: "/recipes" },
  { label: "פוסטים", href: "/blog" },
  { label: "תעודות", href: "/certificates" },
];

export const PUBLIC_FOOTER_NAV: PublicNavLink[] = [
  ...PUBLIC_PRIMARY_NAV,
  { label: "יצירת קשר", href: "/contact" },
  { label: "מדיניות פרטיות", href: "/privacy" },
  { label: "תנאי שימוש", href: "/terms" },
];

export const PUBLIC_CTA = {
  label: "יצירת קשר",
  href: "/contact",
} as const;

export const PUBLIC_STATIC_ROUTES: PublicNavLink[] = [
  ...PUBLIC_FOOTER_NAV,
  { label: "המלצות", href: "/testimonials" },
];
