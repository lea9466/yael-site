import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { privacyPolicyContent } from "@/content/privacy-policy";
import { resolveLegalContactDetails } from "@/lib/legal/resolve-contact-details";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/privacy-policy",
    title: "מדיניות פרטיות",
    description: "מידע על אופן איסוף המידע, השימוש בו ושמירתו באתר.",
  });
}

export default async function PrivacyPolicyPage() {
  const settings = await getWebsiteSettings();
  const content = resolveLegalContactDetails(privacyPolicyContent, {
    email: settings.businessProfile.email,
    phone: settings.businessProfile.phone,
  });

  return (
    <LegalDocumentView
      content={content}
      titleId="privacy-policy-title"
    />
  );
}
