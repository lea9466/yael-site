import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { termsContent } from "@/content/terms";
import { resolveLegalContactDetails } from "@/lib/legal/resolve-contact-details";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/terms",
    title: "תנאי שימוש",
    description: "תנאי השימוש באתר.",
  });
}

export default async function TermsPage() {
  const settings = await getWebsiteSettings();
  const content = resolveLegalContactDetails(termsContent, {
    email: settings.businessProfile.email,
    phone: settings.businessProfile.phone,
  });

  return <LegalDocumentView content={content} titleId="terms-title" />;
}
