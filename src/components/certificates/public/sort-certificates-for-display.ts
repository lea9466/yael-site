import type { CertificateListItem } from "@/lib/certificates/types";

/**
 * Sort by `order` ascending. Equal orders keep a stable relative order
 * (original array index) without mutating stored data.
 */
export function sortCertificatesForDisplay(
  items: CertificateListItem[]
): CertificateListItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      if (left.item.order !== right.item.order) {
        return left.item.order - right.item.order;
      }

      return left.index - right.index;
    })
    .map(({ item }) => item);
}
