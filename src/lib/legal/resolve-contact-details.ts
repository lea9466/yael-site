import type { LegalDocumentContent } from "@/content/legal-document";

type BusinessContactSource = {
  email?: string | null;
  phone?: string | null;
};

/**
 * Prefer live business-profile contact details (same source as /contact)
 * over static placeholders in legal documents.
 */
export function resolveLegalContactDetails(
  content: LegalDocumentContent,
  source: BusinessContactSource
): LegalDocumentContent {
  const email = source.email?.trim() || content.contactDetails.email;
  const phone = source.phone?.trim() || "";

  return {
    ...content,
    contactDetails: {
      ...content.contactDetails,
      email,
      phone,
    },
  };
}
