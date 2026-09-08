export type PublicNavLink = {
  label: string;
  href: string;
};

export const PUBLIC_PRIMARY_NAV: PublicNavLink[] = [
  { label: "תרגישו בבית", href: "/" },
  { label: "הסיפור שלי", href: "/about" },
  { label: "דברים טובים", href: "/services" },
  { label: "מהלב לצלחת", href: "/recipes" },
  { label: "תוכן טוב", href: "/blog" },
  { label: "מאחורי העיתון", href: "/press" },
];

export const PUBLIC_PRESS_NAV_HREF = "/press";

/**
 * Direct link to the flagship "ליווי אישי" service. Appended to the header
 * navigation only (not the footer or sitemap — the service already appears
 * there via the services list).
 */
export const PUBLIC_LIVUY_NAV_LINK: PublicNavLink = {
  label: "הדרך שלך",
  href: "/services/ליווי-אישי",
};

/**
 * Service slugs hidden from the /services listing and the homepage services
 * section. "ליווי אישי" has its own header nav link (PUBLIC_LIVUY_NAV_LINK), so
 * listing it again as a regular service card is redundant. Its detail page,
 * sitemap entry and the nav link all stay live.
 */
export const SERVICES_LISTING_HIDDEN_SLUGS: readonly string[] = ["ליווי-אישי"];

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
    { label: "טוב להיות בקשר", href: "/contact" },
    { label: "מדיניות פרטיות", href: "/privacy-policy" },
    { label: "תנאי שימוש", href: "/terms" },
  ];
}

/** Default footer includes press; runtime footer should use buildPublicFooterNav. */
export const PUBLIC_FOOTER_NAV: PublicNavLink[] = buildPublicFooterNav({
  includePress: true,
});

export const PUBLIC_CTA = {
  label: "טוב להיות בקשר",
  href: "/contact",
} as const;

/** Static sitemap routes — press listing is added dynamically when published items exist. */
export const PUBLIC_STATIC_ROUTES: PublicNavLink[] = [
  ...buildPublicFooterNav({ includePress: false }),
];
