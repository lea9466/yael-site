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
  { label: "כתבות", href: "/press" },
  { label: "תעודות", href: "/certificates" },
];

export const PUBLIC_PRESS_NAV_HREF = "/press";

export function buildPublicPrimaryNav(
  options: { includePress: boolean } = { includePress: false }
): PublicNavLink[] {
  if (options.includePress) {
    return PUBLIC_PRIMARY_NAV;
  }

  return PUBLIC_PRIMARY_NAV.filter((link) => link.href !== PUBLIC_PRESS_NAV_HREF);
}

export function buildPublicFooterNav(
  options: { includePress: boolean } = { includePress: false }
): PublicNavLink[] {
  return [
    ...buildPublicPrimaryNav(options),
    { label: "יצירת קשר", href: "/contact" },
    { label: "מדיניות פרטיות", href: "/privacy-policy" },
    { label: "תנאי שימוש", href: "/terms" },
  ];
}

/** Default footer includes press; runtime footer should use buildPublicFooterNav. */
export const PUBLIC_FOOTER_NAV: PublicNavLink[] = buildPublicFooterNav({
  includePress: true,
});

export const PUBLIC_CTA = {
  label: "יצירת קשר",
  href: "/contact",
} as const;

/** Static sitemap routes — press listing is added dynamically when published items exist. */
export const PUBLIC_STATIC_ROUTES: PublicNavLink[] = [
  ...buildPublicFooterNav({ includePress: false }),
  { label: "המלצות", href: "/testimonials" },
];
