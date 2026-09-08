import type { CertificateItem } from "@/lib/validations/certificate";

export type CertificateMediaPreview = {
  id: string;
  url: string;
  alt: string;
};

export type CertificateListItem = CertificateItem & {
  mediaPreview: CertificateMediaPreview | null;
};

export type CertificatesPageData = {
  items: CertificateListItem[];
  updatedAt: string;
};

export type CertificateFormValues = {
  title: string;
  card_title: string;
  organization: string;
  year: string;
  media_id: string | null;
  description: string;
};

export type CertificateActionResult =
  | { success: true; data?: { id: string; updatedAt: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
