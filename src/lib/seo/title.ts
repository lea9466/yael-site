/**
 * Build a final document title without double-branding when the CMS title
 * already includes the business name.
 */
export function finalizeDocumentTitle(
  title: string,
  brandName: string
): string {
  const trimmedTitle = title.trim();
  const trimmedBrand = brandName.trim();

  if (!trimmedTitle) {
    return trimmedBrand;
  }

  if (!trimmedBrand) {
    return trimmedTitle;
  }

  if (
    trimmedTitle === trimmedBrand ||
    trimmedTitle.includes(trimmedBrand) ||
    trimmedTitle.endsWith(`| ${trimmedBrand}`) ||
    trimmedTitle.startsWith(`${trimmedBrand} |`)
  ) {
    return trimmedTitle;
  }

  return `${trimmedTitle} | ${trimmedBrand}`;
}
