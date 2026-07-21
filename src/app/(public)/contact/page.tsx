import type { Metadata } from "next";

import { ContactPageView } from "@/components/contact/contact-page-view";
import { resolvePublicContactLinks } from "@/lib/contact/public-links";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/contact",
    title: "יצירת קשר",
    description:
      "השאירו פרטים ליצירת קשר עם יעל קנייבסקי — ליווי תזונתי ואכילה מקושרת, בשיחה אישית ורגועה.",
  });
}

export default async function PublicContactPage() {
  const settings = await getWebsiteSettings();
  const links = resolvePublicContactLinks(settings.businessProfile);
  const businessName =
    settings.businessProfile.business_name?.trim() || "יעל";

  return <ContactPageView businessName={businessName} links={links} />;
}
