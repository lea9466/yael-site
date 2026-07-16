import {
  CERTIFICATE_DUPLICATE_TITLE_SUFFIX,
  CERTIFICATE_TITLE_MAX,
} from "@/lib/certificates/constants";

export function formatCertificateYear(year: number | null | undefined): string {
  if (year === null || year === undefined) {
    return "";
  }

  return String(year);
}

export function parseCertificateYearInput(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

export function buildDuplicateCertificateTitle(title: string): string {
  const suffix = CERTIFICATE_DUPLICATE_TITLE_SUFFIX;
  const maxBaseLength = CERTIFICATE_TITLE_MAX - suffix.length;
  const base = title.trim().slice(0, Math.max(maxBaseLength, 1));

  return `${base}${suffix}`;
}
