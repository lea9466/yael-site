import type { CertificateItem } from "@/lib/validations/certificate";

export function sortCertificatesByOrder(
  items: CertificateItem[]
): CertificateItem[] {
  return [...items].sort((left, right) => left.order - right.order);
}

export function normalizeCertificateOrders(
  items: CertificateItem[]
): CertificateItem[] {
  return sortCertificatesByOrder(items).map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function reorderCertificateItems(
  items: CertificateItem[],
  orderedIds: string[]
): CertificateItem[] | null {
  if (orderedIds.length !== items.length) {
    return null;
  }

  const itemById = new Map(items.map((item) => [item.id, item]));

  if (orderedIds.some((id) => !itemById.has(id))) {
    return null;
  }

  const uniqueIds = new Set(orderedIds);

  if (uniqueIds.size !== orderedIds.length) {
    return null;
  }

  return orderedIds.map((id, index) => ({
    ...itemById.get(id)!,
    order: index,
  }));
}
